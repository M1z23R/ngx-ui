import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  viewChild,
} from '@angular/core';
import { TreeComponent } from './tree.component';
import type { TreeNode, TreeNodeContextAction, TreeFormatter } from './tree.component';
import { jsonToTreeNodes, safeStringify, type JsonNodeMeta } from './json-utils';

@Component({
  selector: 'ui-json-tree',
  standalone: true,
  imports: [TreeComponent],
  template: `
    <ui-tree
      [nodes]="nodes()"
      [indent]="indent()"
      [draggable]="draggable()"
      [expandOnClick]="expandOnClick()"
      [contextMenu]="contextMenu()"
      [valueFormatter]="valueFmt"
      [pathFormatter]="pathFmt"
      [objectFormatter]="objectFmt"
      (nodeClick)="nodeClick.emit($event)"
      (nodeContextAction)="nodeContextAction.emit($event)"
    >
      <ng-content select="[slot=context-menu]" />
    </ui-tree>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonTreeComponent {
  readonly json = input<unknown>(undefined);
  readonly rootLabel = input<string>('');
  readonly pathRoot = input<string>('');
  readonly expandDepth = input(1);
  readonly indent = input(16);
  readonly draggable = input(false);
  readonly expandOnClick = input(false);
  readonly contextMenu = input(true);

  readonly nodeClick = output<TreeNode>();
  readonly nodeContextAction = output<TreeNodeContextAction>();

  private readonly tree = viewChild(TreeComponent);

  /** Node currently targeted by the context menu (null when the menu is closed). */
  readonly menuNode = computed<TreeNode | null>(() => this.tree()?.menuNode() ?? null);
  /** Path from root to the targeted node, inclusive. Empty when the menu is closed. */
  readonly menuPath = computed<TreeNode[]>(() => this.tree()?.menuPath() ?? []);
  /** JsonNodeMeta of the targeted node — value/kind/jsonPath, etc. */
  readonly menuMeta = computed<JsonNodeMeta | null>(
    () => (this.menuNode()?.data as JsonNodeMeta | undefined) ?? null,
  );

  readonly nodes = computed<TreeNode[]>(() =>
    jsonToTreeNodes(this.json(), {
      rootLabel: this.rootLabel(),
      pathRoot: this.pathRoot(),
      expandDepth: this.expandDepth(),
    }),
  );

  protected readonly valueFmt: TreeFormatter = (node) => {
    const meta = node.data as JsonNodeMeta | undefined;
    if (!meta) return null;
    if (meta.kind === 'primitive') {
      const v = meta.value;
      if (v === null) return 'null';
      if (v === undefined) return 'undefined';
      if (typeof v === 'string') return v;
      if (typeof v === 'bigint') return v.toString();
      return String(v);
    }
    return safeStringify(meta.value);
  };

  protected readonly pathFmt: TreeFormatter = (node) => {
    const meta = node.data as JsonNodeMeta | undefined;
    return meta ? meta.jsonPath : null;
  };

  protected readonly objectFmt: TreeFormatter = (node) => {
    const meta = node.data as JsonNodeMeta | undefined;
    if (!meta) return null;

    if (meta.key === null) {
      const label = this.rootLabel();
      return label ? safeStringify({ [label]: meta.value }) : safeStringify(meta.value);
    }

    if (typeof meta.key === 'string') {
      return safeStringify({ [meta.key]: meta.value });
    }

    return safeStringify([meta.value]);
  };
}
