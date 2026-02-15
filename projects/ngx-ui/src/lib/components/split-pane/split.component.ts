import {
  Component,
  input,
  output,
  computed,
  contentChildren,
  signal,
  effect,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT, DecimalPipe } from '@angular/common';
import { SplitPaneComponent } from './split-pane.component';

export type SplitOrientation = 'horizontal' | 'vertical';
export type SplitGutterSize = 'sm' | 'md' | 'lg';

export interface SplitSizeChange {
  gutterIndex: number;
  sizes: number[];
}

@Component({
  selector: 'ui-split',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './split.component.html',
  styleUrl: './split.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-split',
    '[class.ui-split--horizontal]': 'orientation() === "horizontal"',
    '[class.ui-split--vertical]': 'orientation() === "vertical"',
    '[class.ui-split--disabled]': 'disabled()',
    '[class.ui-split--dragging]': 'isDragging()',
  },
})
export class SplitComponent {
  readonly orientation = input<SplitOrientation>('horizontal');
  readonly gutterSize = input<SplitGutterSize>('md');
  readonly disabled = input(false);

  readonly sizeChange = output<SplitSizeChange>();
  readonly dragStart = output<number>();
  readonly dragEnd = output<number>();

  readonly panes = contentChildren(SplitPaneComponent);

  protected readonly isDragging = signal(false);
  protected readonly paneSizes = signal<number[]>([]);
  protected readonly gutterIndices = computed(() => {
    const count = this.panes().length;
    return count > 1 ? Array.from({ length: count - 1 }, (_, i) => i) : [];
  });

  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private dragGutterIndex = -1;
  private dragStartPos = 0;
  private dragStartSizes: number[] = [];

  private mouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
  private mouseUpHandler = () => this.onMouseUp();

  constructor() {
    // Single effect to handle pane setup and size distribution
    effect(() => {
      const paneList = this.panes();
      if (paneList.length === 0) return;

      // Set parent reference and index on each pane
      paneList.forEach((pane, index) => {
        pane._setParent(this, index);
      });

      // Calculate sizes based on inputs
      const sizes = this.calculateSizes(paneList);

      // Apply sizes to each pane
      sizes.forEach((size, index) => {
        paneList[index]._setComputedSize(size);
      });

      // Store sizes for drag operations
      this.paneSizes.set(sizes);
    });

    this.destroyRef.onDestroy(() => {
      this.cleanupListeners();
    });
  }

  protected readonly gutterSizeClass = computed(() => {
    return `ui-split__gutter--${this.gutterSize()}`;
  });

  protected onGutterMouseDown(event: MouseEvent, gutterIndex: number): void {
    if (this.disabled()) return;
    event.preventDefault();

    this.dragGutterIndex = gutterIndex;
    this.dragStartPos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    this.dragStartSizes = [...this.paneSizes()];
    this.isDragging.set(true);

    this.dragStart.emit(gutterIndex);

    if (isPlatformBrowser(this.platformId)) {
      this.document.addEventListener('mousemove', this.mouseMoveHandler);
      this.document.addEventListener('mouseup', this.mouseUpHandler);
    }
  }

  protected onGutterKeyDown(event: KeyboardEvent, gutterIndex: number): void {
    if (this.disabled()) return;

    const step = 1;
    const sizes = [...this.paneSizes()];
    const paneList = this.panes();

    const leftPane = paneList[gutterIndex];
    const rightPane = paneList[gutterIndex + 1];

    let delta = 0;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        delta = -step;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        delta = step;
        break;
      case 'Home':
        event.preventDefault();
        delta = -(sizes[gutterIndex] - leftPane.minSize());
        break;
      case 'End':
        event.preventDefault();
        delta = sizes[gutterIndex + 1] - rightPane.minSize();
        break;
      default:
        return;
    }

    const newLeftSize = Math.max(leftPane.minSize(), Math.min(leftPane.maxSize(), sizes[gutterIndex] + delta));
    const actualDelta = newLeftSize - sizes[gutterIndex];
    const newRightSize = Math.max(rightPane.minSize(), Math.min(rightPane.maxSize(), sizes[gutterIndex + 1] - actualDelta));

    sizes[gutterIndex] = newLeftSize;
    sizes[gutterIndex + 1] = newRightSize;

    this.paneSizes.set(sizes);
    leftPane._setComputedSize(newLeftSize);
    rightPane._setComputedSize(newRightSize);
    this.sizeChange.emit({ gutterIndex, sizes: [...sizes] });
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;

    const container = this.elementRef.nativeElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const containerSize = this.orientation() === 'horizontal' ? containerRect.width : containerRect.height;

    const currentPos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const deltaPixels = currentPos - this.dragStartPos;
    const deltaPercent = (deltaPixels / containerSize) * 100;

    const paneList = this.panes();
    const leftPane = paneList[this.dragGutterIndex];
    const rightPane = paneList[this.dragGutterIndex + 1];

    let newLeftSize = this.dragStartSizes[this.dragGutterIndex] + deltaPercent;
    let newRightSize = this.dragStartSizes[this.dragGutterIndex + 1] - deltaPercent;

    // Apply min/max constraints
    if (newLeftSize < leftPane.minSize()) {
      const diff = leftPane.minSize() - newLeftSize;
      newLeftSize = leftPane.minSize();
      newRightSize += diff;
    } else if (newLeftSize > leftPane.maxSize()) {
      const diff = newLeftSize - leftPane.maxSize();
      newLeftSize = leftPane.maxSize();
      newRightSize += diff;
    }

    if (newRightSize < rightPane.minSize()) {
      const diff = rightPane.minSize() - newRightSize;
      newRightSize = rightPane.minSize();
      newLeftSize -= diff;
    } else if (newRightSize > rightPane.maxSize()) {
      const diff = newRightSize - rightPane.maxSize();
      newRightSize = rightPane.maxSize();
      newLeftSize -= diff;
    }

    // Final clamp
    newLeftSize = Math.max(leftPane.minSize(), Math.min(leftPane.maxSize(), newLeftSize));
    newRightSize = Math.max(rightPane.minSize(), Math.min(rightPane.maxSize(), newRightSize));

    const sizes = [...this.paneSizes()];
    sizes[this.dragGutterIndex] = newLeftSize;
    sizes[this.dragGutterIndex + 1] = newRightSize;

    this.paneSizes.set(sizes);
    leftPane._setComputedSize(newLeftSize);
    rightPane._setComputedSize(newRightSize);
    this.sizeChange.emit({ gutterIndex: this.dragGutterIndex, sizes: [...sizes] });
  }

  private onMouseUp(): void {
    if (!this.isDragging()) return;

    this.cleanupListeners();
    this.isDragging.set(false);
    this.dragEnd.emit(this.dragGutterIndex);
    this.dragGutterIndex = -1;
  }

  private cleanupListeners(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener('mousemove', this.mouseMoveHandler);
      this.document.removeEventListener('mouseup', this.mouseUpHandler);
    }
  }

  private calculateSizes(paneList: readonly SplitPaneComponent[]): number[] {
    if (paneList.length === 0) {
      return [];
    }

    const sizes: number[] = [];
    let totalExplicit = 0;
    let implicitCount = 0;

    paneList.forEach((pane) => {
      const size = pane.size();
      if (size !== undefined) {
        totalExplicit += size;
        sizes.push(size);
      } else {
        implicitCount++;
        sizes.push(-1); // placeholder
      }
    });

    // Calculate remaining space for implicit panes
    const remaining = Math.max(0, 100 - totalExplicit);
    const implicitSize = implicitCount > 0 ? remaining / implicitCount : 0;

    // Replace placeholders
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] === -1) {
        sizes[i] = implicitSize;
      }
    }

    // Normalize if total exceeds 100
    const total = sizes.reduce((a, b) => a + b, 0);
    if (total > 0 && Math.abs(total - 100) > 0.01) {
      const scale = 100 / total;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] *= scale;
      }
    }

    return sizes;
  }

  /** @internal - Get current sizes for external access */
  _getSizes(): number[] {
    return [...this.paneSizes()];
  }
}
