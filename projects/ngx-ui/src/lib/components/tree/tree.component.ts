import { Component, input, output, signal, InjectionToken, ChangeDetectionStrategy } from '@angular/core';
import { TreeNodeComponent } from './tree-node.component';

export interface TreeNode {
  label: string;
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

export const TREE_HOST = new InjectionToken<TreeComponent>('TREE_HOST');

@Component({
  selector: 'ui-tree',
  standalone: true,
  imports: [TreeNodeComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TREE_HOST, useExisting: TreeComponent }],
})
export class TreeComponent {
  readonly nodes = input<TreeNode[]>([]);
  readonly indent = input(16);
  readonly draggable = input(false);

  readonly nodeClick = output<TreeNode>();
  readonly nodeExpand = output<TreeNode>();
  readonly nodeCollapse = output<TreeNode>();
  readonly nodeDrop = output<TreeNodeDropEvent>();

  /** @internal */
  readonly _dragNode = signal<TreeNode | null>(null);
  /** @internal */
  readonly _dragOverNode = signal<TreeNode | null>(null);
  /** @internal */
  readonly _dropPosition = signal<TreeDropPosition | null>(null);

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
}
