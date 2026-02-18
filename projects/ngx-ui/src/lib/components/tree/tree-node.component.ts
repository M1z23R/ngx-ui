import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import type { TreeNode, TreeDropPosition } from './tree.component';
import { TREE_HOST } from './tree.component';

function isDescendantOf(target: TreeNode, potentialAncestor: TreeNode): boolean {
  if (!potentialAncestor.children) return false;
  for (const child of potentialAncestor.children) {
    if (child === target || isDescendantOf(target, child)) return true;
  }
  return false;
}

@Component({
  selector: 'ui-tree-node',
  standalone: true,
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent {
  readonly node = input.required<TreeNode>();
  readonly level = input(0);
  readonly indent = input(16);

  readonly nodeClick = output<TreeNode>();
  readonly nodeExpand = output<TreeNode>();
  readonly nodeCollapse = output<TreeNode>();

  private readonly treeHost = inject(TREE_HOST);

  private readonly _expanded = signal<boolean | null>(null);

  readonly isExpanded = computed(() => {
    const manualState = this._expanded();
    if (manualState !== null) {
      return manualState;
    }
    return this.node().expanded ?? false;
  });

  readonly hasChildren = computed(() => {
    const children = this.node().children;
    return children && children.length > 0;
  });

  readonly indentGuides = computed(() => {
    const lvl = this.level();
    return lvl > 0 ? Array.from({ length: lvl }, (_, i) => i) : [];
  });

  readonly isDraggable = computed(() => this.treeHost.draggable());

  readonly isDragging = computed(() => this.treeHost._dragNode() === this.node());

  readonly dropPosition = computed<TreeDropPosition | null>(() => {
    if (this.treeHost._dragOverNode() === this.node()) {
      return this.treeHost._dropPosition();
    }
    return null;
  });

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.hasChildren()) return;

    const newState = !this.isExpanded();
    this._expanded.set(newState);

    if (newState) {
      this.nodeExpand.emit(this.node());
    } else {
      this.nodeCollapse.emit(this.node());
    }
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.nodeClick.emit(this.node());
  }

  onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.hasChildren()) {
      this.toggle(event);
    }
  }

  onDragStart(event: DragEvent): void {
    if (!this.isDraggable()) return;
    this.treeHost._dragNode.set(this.node());
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', this.node().label);
  }

  onDragEnd(): void {
    this.treeHost._dragNode.set(null);
    this.treeHost._dragOverNode.set(null);
    this.treeHost._dropPosition.set(null);
  }

  onDragOver(event: DragEvent): void {
    if (!this.isDraggable()) return;

    const dragNode = this.treeHost._dragNode();
    if (!dragNode) return;

    // Prevent dropping on self or own descendants
    if (dragNode === this.node() || isDescendantOf(this.node(), dragNode)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    const target = (event.currentTarget as HTMLElement).querySelector('.ui-tree-node__content') as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = y / rect.height;

    let position: TreeDropPosition;
    if (ratio < 0.25) {
      position = 'before';
    } else if (ratio > 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    this.treeHost._dragOverNode.set(this.node());
    this.treeHost._dropPosition.set(position);
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    const current = event.currentTarget as HTMLElement;
    if (related && current.contains(related)) return;

    if (this.treeHost._dragOverNode() === this.node()) {
      this.treeHost._dragOverNode.set(null);
      this.treeHost._dropPosition.set(null);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    const dragNode = this.treeHost._dragNode();
    const position = this.treeHost._dropPosition();
    if (!dragNode || !position) return;

    if (dragNode === this.node() || isDescendantOf(this.node(), dragNode)) {
      return;
    }

    this.treeHost._emitDrop({
      node: dragNode,
      target: this.node(),
      position,
    });

    this.treeHost._dragNode.set(null);
    this.treeHost._dragOverNode.set(null);
    this.treeHost._dropPosition.set(null);
  }

  /** @internal - forward events from child nodes */
  _onChildNodeClick(node: TreeNode): void {
    this.nodeClick.emit(node);
  }

  /** @internal */
  _onChildNodeExpand(node: TreeNode): void {
    this.nodeExpand.emit(node);
  }

  /** @internal */
  _onChildNodeCollapse(node: TreeNode): void {
    this.nodeCollapse.emit(node);
  }
}
