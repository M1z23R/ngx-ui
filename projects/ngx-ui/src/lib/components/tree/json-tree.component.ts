import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
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
    />
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
    return meta ? safeStringify(meta.value) : null;
  };
}
