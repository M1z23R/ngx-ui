import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import type { TreeNode } from './tree.component';

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
