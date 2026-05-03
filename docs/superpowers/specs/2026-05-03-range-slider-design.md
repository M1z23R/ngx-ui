# Range Slider (time / date / datetime) — Design

A dual-thumb range slider component for selecting a time/date/datetime range
between user-supplied min and max bounds. Mirrors the existing `ui-slider`
visual language and the `ui-timepicker` / `ui-datepicker` / `ui-datetimepicker`
mode trio, but in a single unified component.

## Goals

- One component, three modes — `time`, `date`, `datetime`.
- Familiar pointer + keyboard interaction.
- Reuses existing slider visual tokens for consistency.
- Signal-based, OnPush, standalone — matches library conventions.

## Component & Public API

**Selector:** `ui-range-slider`
**Path:** `projects/ngx-ui/src/lib/components/range-slider/range-slider.component.{ts,html,scss}`

```ts
export type RangeSliderMode = 'time' | 'date' | 'datetime';
export type RangeSliderSize = 'sm' | 'md' | 'lg';
export interface DateRangeValue { start: Date; end: Date; }

@Component({ selector: 'ui-range-slider', standalone: true, changeDetection: OnPush })
export class RangeSliderComponent {
  readonly min = input.required<Date>();
  readonly max = input.required<Date>();

  readonly mode    = input<RangeSliderMode>('datetime');
  readonly size    = input<RangeSliderSize>('md');
  readonly label   = input('');
  readonly disabled = input(false);

  // Step in milliseconds. null → mode default.
  readonly step = input<number | null>(null);

  readonly showBubbles = input(true);
  readonly showRange   = input(false);
  readonly format      = input<string | null>(null); // override display format

  readonly value = model<DateRangeValue | null>(null);
  readonly valueCommit = output<DateRangeValue>();
}
```

### Default step per mode

| Mode       | Default step       |
|------------|--------------------|
| `time`     | 15 minutes         |
| `date`     | 1 day              |
| `datetime` | 30 minutes         |

### Default display format per mode

| Mode       | Default format         | Notes                                            |
|------------|------------------------|--------------------------------------------------|
| `time`     | `HH:mm`                | `HH:mm:ss` if step < 60_000ms                    |
| `date`     | `MMM d, yyyy`          |                                                  |
| `datetime` | `MMM d, HH:mm`         |                                                  |

Consumers may override via `format` input. Formatting uses
`Intl.DateTimeFormat` for date parts and a simple zero-padded `HH:mm[:ss]`
helper for time — no extra dependencies.

### Mode semantics

- `time`: the date portion of `min`/`max` is preserved; consumers typically pass
  `min = today 00:00`, `max = today 23:59`. Component does not reinterpret.
- `date`: any emitted value's time-of-day is normalized to the time of `min`,
  so steps stay aligned (avoids drift).
- `datetime`: full timestamp.

## Layout

```
┌─────────────────────────────────────────────────┐
│  Label (optional)                               │
│                                                 │
│        ┌─14:30─┐               ┌─17:00─┐        │  ← bubbles (showBubbles)
│        ▼       ▼               ▼       ▼        │
│  ──────●═══════════════════════●──────────      │  ← track w/ filled segment
│                                                 │
│  14:30 → 17:00                                  │  ← optional range line (showRange)
└─────────────────────────────────────────────────┘
```

- Track: reuses `--ui-bg-tertiary` (background) and `--ui-primary` (filled
  portion between thumbs), with `--ui-radius-xl` rounded corners. Same heights
  as `ui-slider` (4 / 6 / 8 px for sm/md/lg).
- Thumbs: circular, `--ui-primary` fill, 2px `--ui-bg` border, `--ui-shadow-sm`.
  Same diameters as `ui-slider` (14 / 18 / 24 px). Hover scale 1.1, active
  scale 1.15 with focus ring.
- Bubbles: small chip with downward arrow. `--ui-bg` background,
  `--ui-border` border, `--ui-text` text, `--ui-radius-sm`. Always visible
  while `showBubbles` is true (default).
- Range line: muted text below the track, only when `showRange` is true.

## Interaction

- **Pointer drag** on a thumb: `pointerdown` → `setPointerCapture` →
  `pointermove` updates → `pointerup` releases. Works for mouse, touch, pen.
- **Track click**: moves the **nearest** thumb to that position.
- **Clamping**: dragged thumb stops at the other thumb's position. No swapping
  — keeps the start/end identity stable.
- **Snapping**: every position snaps to the nearest multiple of `step`
  starting from `min`. The final allowed value is always `max` even if
  `(max − min) % step !== 0`.
- **Keyboard** (focused thumb):
  - `←` / `→`: ±1 step
  - `Shift + ←` / `Shift + →`: ±10 steps
  - `Home`: jump to `min` (start thumb) or to the start thumb (end thumb)
  - `End`: jump to the end thumb (start thumb) or to `max` (end thumb)
- **A11y**: each thumb is `<div role="slider" tabindex="0" aria-valuemin
  aria-valuemax aria-valuenow aria-valuetext aria-orientation="horizontal"
  aria-label="...">`. `aria-valuetext` is the formatted display string.
- **Commit semantics**:
  - `value` model updates **live** during drag/keyboard (every change).
  - `valueCommit` fires only on `pointerup` / keyboard `keyup`. Mirrors
    existing `ui-slider`.
- **Initial value**: when `value()` is `null`, internal state initializes
  thumbs at `min` and `max`, but `value` stays `null` until first interaction.

## Internal Architecture

Single component, no sub-components.

State (signals):

- `startMs = signal<number>(min)` — start as epoch ms
- `endMs = signal<number>(max)`
- `dragging = signal<'start' | 'end' | null>(null)`
- `trackEl` via `viewChild<ElementRef>('track')`

Computed:

- `effectiveStep = computed(() => step() ?? defaultStepFor(mode()))`
- `minMs / maxMs` from `min()` / `max()`
- `startPercent / endPercent` for thumb positions
- `fillLeft / fillWidth` for the filled segment
- `startLabel / endLabel` via internal formatter

Effects:

- External `value()` change → update `startMs` / `endMs` (clamped to
  `[min, max]`, snapped to step).
- `startMs` / `endMs` change → write to `value` model (only when they actually
  changed vs. previous emitted value, to avoid feedback loops).

Helpers (private):

- `pixelToMs(clientX): number` — uses track `getBoundingClientRect`, snaps to
  step, clamps to `[min, max]`.
- `nearestThumb(ms): 'start' | 'end'` — by absolute distance.
- Pointer handlers use `setPointerCapture` on the thumb element. No global
  document listeners outstanding when not dragging.

## Demo

Add a "Range Slider" section to `projects/demo/src/app/app.ts` (and template)
showing:

- Time range (default step 15min) — `min = today 00:00`, `max = today 23:59`
- Date range (default 1 day step) — last 90 days range
- Datetime range (default 30min) — next 7 days
- Disabled example
- Custom step example (e.g. 5-minute time range)
- `showRange` toggled on

## Tests

Vitest unit tests in `range-slider.component.spec.ts`:

- Snaps to step correctly (math).
- Start cannot pass end (clamping).
- Keyboard arrow keys move by step; Shift moves by 10 steps; Home/End jump.
- Mode-specific default formatting renders expected string.
- `value` updates during drag; `valueCommit` only fires on release.
- External `value` input is reflected in thumb positions.

## Public API

Add to `projects/ngx-ui/src/public-api.ts`:

```ts
export { RangeSliderComponent } from './lib/components/range-slider/range-slider.component';
export type {
  RangeSliderMode,
  RangeSliderSize,
  DateRangeValue,
} from './lib/components/range-slider/range-slider.component';
```

## Out of Scope (YAGNI)

- Dragging the filled segment to shift the whole range.
- Tick marks / step labels along the track.
- Multiple thumbs (>2).
- Non-linear scales / logarithmic.
- I18n beyond what `Intl.DateTimeFormat` provides.
- `ControlValueAccessor` integration — no other picker in this library
  implements it; keeping consistency.
- Vertical orientation.
