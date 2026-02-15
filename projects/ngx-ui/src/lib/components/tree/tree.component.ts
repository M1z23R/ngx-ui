import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TreeNodeComponent } from './tree-node.component';

export interface TreeNode {
  label: string;
  icon?: string;
  expanded?: boolean;
  children?: TreeNode[];
  data?: unknown;
}

@Component({
  selector: 'ui-tree',
  standalone: true,
  imports: [TreeNodeComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent {
  readonly nodes = input<TreeNode[]>([]);
  readonly indent = input(16);

  readonly nodeClick = output<TreeNode>();
  readonly nodeExpand = output<TreeNode>();
  readonly nodeCollapse = output<TreeNode>();

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
}
