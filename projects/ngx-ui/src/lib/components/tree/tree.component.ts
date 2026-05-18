import {
  Component,
  input,
  output,
  signal,
  computed,
  viewChild,
  InjectionToken,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TreeNodeComponent } from './tree-node.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { DropdownItemComponent } from '../dropdown/dropdown-item.component';
import { DropdownDividerComponent } from '../dropdown/dropdown-divider.component';

export interface TreeLabelToken {
  text: string;
  class?: string;
}

export interface TreeNode {
  label: string;
  /** Optional structured label. When present, rendered in place of `label` as a sequence of styled spans. */
  labelTokens?: TreeLabelToken[];
  icon?: string;
  expanded?: boolean;
  children?: TreeNode[];
  data?: unknown;
}

export type TreeDropPosition = 'before' | 'after' | 'inside';

export interface TreeNodeDropEvent {
  node: TreeNode;
  target: TreeNode;
  position: TreeDropPosition;
}

export type TreeNodeActionType =
  | 'copyValue'
  | 'copyPath'
  | 'copyObject'
  | 'expandAll'
  | 'collapseAll'
  | 'goToParent'
  | 'collapseParent';

export interface TreeNodeContextAction {
  node: TreeNode;
  path: TreeNode[];
  action: TreeNodeActionType;
}

export type TreeFormatter = (node: TreeNode, path: TreeNode[]) => string | null | undefined;

export const TREE_HOST = new InjectionToken<TreeComponent>('TREE_HOST');

@Component({
  selector: 'ui-tree',
  standalone: true,
  imports: [TreeNodeComponent, DropdownComponent, DropdownItemComponent, DropdownDividerComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TREE_HOST, useExisting: TreeComponent }],
})
export class TreeComponent {
  readonly nodes = input<TreeNode[]>([]);
  readonly indent = input(16);
  readonly draggable = input(false);
  readonly expandOnClick = input(false);
  readonly contextMenu = input(false);
  readonly pathSeparator = input(' / ');
  readonly valueFormatter = input<TreeFormatter | null>(null);
  readonly pathFormatter = input<TreeFormatter | null>(null);
  readonly objectFormatter = input<TreeFormatter | null>(null);

  readonly nodeClick = output<TreeNode>();
  readonly nodeExpand = output<TreeNode>();
  readonly nodeCollapse = output<TreeNode>();
  readonly nodeDrop = output<TreeNodeDropEvent>();
  readonly nodeContextAction = output<TreeNodeContextAction>();

  /** @internal */
  readonly _dragNode = signal<TreeNode | null>(null);
  /** @internal */
  readonly _dragOverNode = signal<TreeNode | null>(null);
  /** @internal */
  readonly _dropPosition = signal<TreeDropPosition | null>(null);

  /** @internal */
  readonly _flashNode = signal<TreeNode | null>(null);

  /** @internal context-menu target — node and its path (root → node, inclusive) */
  readonly _menuNode = signal<TreeNode | null>(null);
  /** @internal */
  readonly _menuPath = signal<TreeNode[]>([]);

  /** @internal whether the targeted node has children (drives expand/collapse-all visibility) */
  readonly _menuHasChildren = computed(() => {
    const n = this._menuNode();
    return !!n?.children && n.children.length > 0;
  });
  /** @internal whether the targeted node has a parent (drives go-to/collapse-parent visibility) */
  readonly _menuHasParent = computed(() => this._menuPath().length > 1);

  private readonly _expansion = signal<ReadonlyMap<TreeNode, boolean>>(new Map());
  private readonly _nodeElements = new WeakMap<TreeNode, HTMLElement>();
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly menu = viewChild<DropdownComponent>('treeMenu');

  isExpanded(node: TreeNode): boolean {
    const override = this._expansion().get(node);
    return override ?? (node.expanded ?? false);
  }

  setExpanded(node: TreeNode, value: boolean): void {
    const current = this.isExpanded(node);
    if (current === value) return;
    const next = new Map(this._expansion());
    next.set(node, value);
    this._expansion.set(next);
    if (value) {
      this.nodeExpand.emit(node);
    } else {
      this.nodeCollapse.emit(node);
    }
  }

  expandSubtree(node: TreeNode, value: boolean): void {
    const next = new Map(this._expansion());
    const walk = (n: TreeNode) => {
      if (!n.children?.length) return;
      next.set(n, value);
      for (const c of n.children) walk(c);
    };
    walk(node);
    this._expansion.set(next);
  }

  /** @internal */
  _onNodeClick(node: TreeNode): void {
    this.nodeClick.emit(node);
  }

  /** @internal */
  _onNodeExpand(node: TreeNode): void {
    this.nodeExpand.emit(node);
  }

  /** @internal */
  _onNodeCollapse(node: TreeNode): void {
    this.nodeCollapse.emit(node);
  }

  /** @internal */
  _emitDrop(event: TreeNodeDropEvent): void {
    this.nodeDrop.emit(event);
  }

  /** @internal */
  _registerNode(node: TreeNode, el: HTMLElement): void {
    this._nodeElements.set(node, el);
  }

  /** @internal */
  _unregisterNode(node: TreeNode): void {
    this._nodeElements.delete(node);
  }

  /** @internal */
  _openContextMenu(node: TreeNode, path: TreeNode[], x: number, y: number): void {
    this._menuNode.set(node);
    this._menuPath.set(path);
    this.menu()?.openAt(x, y);
  }

  /** @internal */
  _runAction(action: TreeNodeActionType): void {
    const node = this._menuNode();
    const path = this._menuPath();
    if (!node) return;

    switch (action) {
      case 'copyValue': {
        const text = this.valueFormatter()?.(node, path) ?? node.label;
        this.copyToClipboard(text);
        break;
      }
      case 'copyPath': {
        const text =
          this.pathFormatter()?.(node, path) ??
          path.map((n) => n.label).join(this.pathSeparator());
        this.copyToClipboard(text);
        break;
      }
      case 'copyObject': {
        const text = this.objectFormatter()?.(node, path) ?? this.serializeNode(node);
        this.copyToClipboard(text);
        break;
      }
      case 'expandAll':
        this.expandSubtree(node, true);
        break;
      case 'collapseAll':
        this.expandSubtree(node, false);
        break;
      case 'goToParent': {
        const parent = path[path.length - 2];
        if (parent) this.scrollAndFlash(parent);
        break;
      }
      case 'collapseParent': {
        const parent = path[path.length - 2];
        if (parent) this.setExpanded(parent, false);
        break;
      }
    }

    this.nodeContextAction.emit({ node, path, action });
  }

  private serializeNode(node: TreeNode): string {
    const value = node.data !== undefined ? node.data : this.sanitize(node);
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  private sanitize(node: TreeNode): unknown {
    return {
      label: node.label,
      ...(node.icon !== undefined ? { icon: node.icon } : {}),
      ...(node.children?.length ? { children: node.children.map((c) => this.sanitize(c)) } : {}),
    };
  }

  private scrollAndFlash(node: TreeNode): void {
    const el = this._nodeElements.get(node);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    this._flashNode.set(node);
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => {
      this._flashNode.set(null);
      this.flashTimer = null;
    }, 1000);
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => this.execCommandCopy(text));
    } else {
      this.execCommandCopy(text);
    }
  }

  private execCommandCopy(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
  }
}
