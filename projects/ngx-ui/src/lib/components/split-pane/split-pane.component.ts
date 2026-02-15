import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
} from '@angular/core';
import type { SplitComponent } from './split.component';

@Component({
  selector: 'ui-split-pane',
  standalone: true,
  templateUrl: './split-pane.component.html',
  styleUrl: './split-pane.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-split-pane',
    '[style.flex]': 'flexStyle()',
    '[style.order]': 'orderStyle()',
  },
})
export class SplitPaneComponent {
  readonly size = input<number | undefined>(undefined);
  readonly minSize = input(0);
  readonly maxSize = input(100);

  /** @internal */
  readonly _index = signal(0);
  /** @internal */
  readonly _computedSize = signal<number>(0);

  private _parent: SplitComponent | null = null;

  readonly elementRef = inject(ElementRef);

  protected readonly flexStyle = computed(() => {
    const size = this._computedSize();
    return `0 0 ${size}%`;
  });

  protected readonly orderStyle = computed(() => {
    return this._index() * 2;
  });

  /** @internal */
  _setParent(parent: SplitComponent, index: number): void {
    this._parent = parent;
    this._index.set(index);
  }

  /** @internal */
  _setComputedSize(size: number): void {
    this._computedSize.set(size);
  }

  /** @internal */
  _getParent(): SplitComponent | null {
    return this._parent;
  }
}
