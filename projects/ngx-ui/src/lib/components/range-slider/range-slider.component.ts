import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';

export type RangeSliderMode = 'time' | 'date' | 'datetime';
export type RangeSliderSize = 'sm' | 'md' | 'lg';
export type RangeSliderBubbles = 'always' | 'active' | 'never';

export interface DateRangeValue {
  start: Date;
  end: Date;
}

type ThumbId = 'start' | 'end';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

const DEFAULT_STEP: Record<RangeSliderMode, number> = {
  time: 15 * MS_PER_MINUTE,
  date: MS_PER_DAY,
  datetime: 30 * MS_PER_MINUTE,
};

@Component({
  selector: 'ui-range-slider',
  standalone: true,
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent {
  readonly min = input.required<Date>();
  readonly max = input.required<Date>();

  readonly mode = input<RangeSliderMode>('datetime');
  readonly size = input<RangeSliderSize>('md');
  readonly label = input('');
  readonly disabled = input(false);

  readonly step = input<number | null>(null);

  readonly bubbles = input<RangeSliderBubbles>('always');
  readonly showRange = input(false);
  readonly format = input<string | null>(null);

  readonly value = model<DateRangeValue | null>(null);
  readonly valueCommit = output<DateRangeValue>();

  protected readonly trackEl = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly startMs = signal(0);
  protected readonly endMs = signal(0);
  protected readonly dragging = signal<ThumbId | null>(null);
  protected readonly focusedThumb = signal<ThumbId | null>(null);
  protected readonly hoveredThumb = signal<ThumbId | null>(null);

  private lastEmitted: DateRangeValue | null = null;

  protected readonly minMs = computed(() => this.min().getTime());
  protected readonly maxMs = computed(() => this.max().getTime());
  protected readonly range = computed(() => Math.max(0, this.maxMs() - this.minMs()));

  protected readonly effectiveStep = computed(() => {
    const explicit = this.step();
    return explicit && explicit > 0 ? explicit : DEFAULT_STEP[this.mode()];
  });

  protected readonly startPercent = computed(() => this.toPercent(this.startMs()));
  protected readonly endPercent = computed(() => this.toPercent(this.endMs()));

  protected readonly fillStyle = computed(() => {
    const start = this.startPercent();
    const end = this.endPercent();
    return { left: `${start}%`, width: `${Math.max(0, end - start)}%` };
  });

  protected readonly startLabel = computed(() => this.formatMs(this.startMs()));
  protected readonly endLabel = computed(() => this.formatMs(this.endMs()));

  protected readonly bubbleVisible = computed(() => {
    const mode = this.bubbles();
    if (mode === 'never') return { start: false, end: false };
    if (mode === 'always') return { start: true, end: true };
    // 'active' — visible when dragged, hovered, or focused
    const active = (t: ThumbId) =>
      this.dragging() === t || this.focusedThumb() === t || this.hoveredThumb() === t;
    return { start: active('start'), end: active('end') };
  });

  protected readonly rootClasses = computed(() => {
    const classes = ['ui-range-slider', `ui-range-slider--${this.size()}`];
    if (this.disabled()) classes.push('ui-range-slider--disabled');
    return classes.join(' ');
  });

  constructor() {
    // Sync external value → internal thumb positions. Falls back to [min, max] when null.
    effect(() => {
      const min = this.minMs();
      const max = this.maxMs();
      const v = this.value();
      if (v) {
        this.startMs.set(this.snap(this.clamp(v.start.getTime())));
        this.endMs.set(this.snap(this.clamp(v.end.getTime())));
        this.lastEmitted = v;
      } else {
        this.startMs.set(min);
        this.endMs.set(max);
        this.lastEmitted = null;
      }
    });
  }

  /** Push current thumb state into the value model (live, during interaction). */
  private writeValue(): void {
    const next: DateRangeValue = {
      start: this.materialize(this.startMs()),
      end: this.materialize(this.endMs()),
    };
    const prev = this.lastEmitted;
    if (
      prev &&
      prev.start.getTime() === next.start.getTime() &&
      prev.end.getTime() === next.end.getTime()
    ) {
      return;
    }
    this.lastEmitted = next;
    this.value.set(next);
  }

  // -- Pointer handling -------------------------------------------------

  protected onThumbPointerDown(event: PointerEvent, thumb: ThumbId): void {
    if (this.disabled()) return;
    event.preventDefault();
    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.dragging.set(thumb);
    this.focusedThumb.set(thumb);
    target.focus();
  }

  protected onThumbPointerMove(event: PointerEvent, thumb: ThumbId): void {
    if (this.dragging() !== thumb) return;
    event.preventDefault();
    const ms = this.pixelToMs(event.clientX);
    this.setThumb(thumb, ms);
  }

  protected onThumbPointerUp(event: PointerEvent, thumb: ThumbId): void {
    if (this.dragging() !== thumb) return;
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.dragging.set(null);
    this.commit();
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;
    if ((event.target as HTMLElement).dataset['thumb']) return; // ignore thumb hits
    const ms = this.pixelToMs(event.clientX);
    const thumb: ThumbId =
      Math.abs(ms - this.startMs()) <= Math.abs(ms - this.endMs()) ? 'start' : 'end';
    this.setThumb(thumb, ms);
    this.commit();
  }

  // -- Keyboard ---------------------------------------------------------

  protected onThumbKeyDown(event: KeyboardEvent, thumb: ThumbId): void {
    if (this.disabled()) return;
    const step = this.effectiveStep();
    const big = step * 10;
    let delta = 0;
    let target: number | null = null;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = event.shiftKey ? -big : -step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        delta = event.shiftKey ? big : step;
        break;
      case 'Home':
        target = thumb === 'start' ? this.minMs() : this.startMs();
        break;
      case 'End':
        target = thumb === 'end' ? this.maxMs() : this.endMs();
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target !== null) {
      this.setThumb(thumb, target);
    } else {
      const current = thumb === 'start' ? this.startMs() : this.endMs();
      this.setThumb(thumb, current + delta);
    }
  }

  protected onThumbKeyUp(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (keys.includes(event.key)) {
      this.commit();
    }
  }

  protected onThumbFocus(thumb: ThumbId): void {
    this.focusedThumb.set(thumb);
  }

  protected onThumbBlur(): void {
    this.focusedThumb.set(null);
  }

  protected onThumbEnter(thumb: ThumbId): void {
    this.hoveredThumb.set(thumb);
  }

  protected onThumbLeave(): void {
    this.hoveredThumb.set(null);
  }

  // -- Internal helpers -------------------------------------------------

  private setThumb(thumb: ThumbId, msRaw: number): void {
    const snapped = this.snap(this.clamp(msRaw));
    let changed = false;
    if (thumb === 'start') {
      const next = Math.min(snapped, this.endMs());
      if (next !== this.startMs()) {
        this.startMs.set(next);
        changed = true;
      }
    } else {
      const next = Math.max(snapped, this.startMs());
      if (next !== this.endMs()) {
        this.endMs.set(next);
        changed = true;
      }
    }
    if (changed) this.writeValue();
  }

  private commit(): void {
    if (this.lastEmitted) {
      this.valueCommit.emit(this.lastEmitted);
    }
  }

  private clamp(ms: number): number {
    return Math.min(this.maxMs(), Math.max(this.minMs(), ms));
  }

  private snap(ms: number): number {
    const min = this.minMs();
    const max = this.maxMs();
    const step = this.effectiveStep();
    if (step <= 0 || min >= max) return ms;
    const offset = ms - min;
    const snapped = min + Math.round(offset / step) * step;
    if (snapped > max) return max;
    if (snapped < min) return min;
    return snapped;
  }

  private toPercent(ms: number): number {
    const range = this.range();
    if (range <= 0) return 0;
    return ((ms - this.minMs()) / range) * 100;
  }

  private pixelToMs(clientX: number): number {
    const el = this.trackEl()?.nativeElement;
    if (!el) return this.minMs();
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return this.minMs();
    const ratio = (clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, ratio));
    return this.minMs() + clamped * this.range();
  }

  /**
   * Convert internal ms to a Date appropriate for the current mode.
   * date mode normalizes time-of-day to that of `min`.
   */
  private materialize(ms: number): Date {
    if (this.mode() === 'date') {
      const minDate = this.min();
      const d = new Date(ms);
      d.setHours(
        minDate.getHours(),
        minDate.getMinutes(),
        minDate.getSeconds(),
        minDate.getMilliseconds(),
      );
      return d;
    }
    return new Date(ms);
  }

  // -- Formatting -------------------------------------------------------

  private formatMs(ms: number): string {
    const date = new Date(ms);
    const override = this.format();
    if (override) return this.applyFormat(date, override);
    switch (this.mode()) {
      case 'time':
        return this.effectiveStep() < MS_PER_MINUTE
          ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
          : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      case 'date':
        return new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(date);
      case 'datetime':
        return `${new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
        }).format(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }

  /** Tiny formatter for common tokens: yyyy MM dd HH mm ss MMM d. */
  private applyFormat(date: Date, fmt: string): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return fmt
      .replace(/yyyy/g, String(date.getFullYear()))
      .replace(/MMM/g, months[date.getMonth()])
      .replace(/MM/g, pad(date.getMonth() + 1))
      .replace(/dd/g, pad(date.getDate()))
      .replace(/d/g, String(date.getDate()))
      .replace(/HH/g, pad(date.getHours()))
      .replace(/mm/g, pad(date.getMinutes()))
      .replace(/ss/g, pad(date.getSeconds()));
  }
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
