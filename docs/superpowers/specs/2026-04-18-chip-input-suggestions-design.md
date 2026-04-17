# Chip Input: Suggestions / Options Support

**Date:** 2026-04-18
**Component:** `ui-chip-input` (`projects/ngx-ui/src/lib/components/chip-input/`)

## Goal

Extend `ui-chip-input` to support a suggestions dropdown (static list and/or async search), while preserving its current free-text chip behavior. Mirror the relevant parts of `ui-select`'s API so consumers find the surface familiar.

## Decisions

| Topic                          | Decision                                                                 |
|--------------------------------|--------------------------------------------------------------------------|
| Free text vs. pick-only        | Free text by default (creatable). `strict = true` disables free text.    |
| Suggestion source              | Static array input **and** async function. No content-child projection.  |
| Already-picked suggestions     | Hidden from the dropdown list.                                           |
| Dropdown open trigger          | On focus. Closes on blur / Escape / selection.                           |
| Label/value separation         | Supported: chip stores `value`, display uses `label` via internal cache. |
| Option-template customization  | Supported via `optionTemplate` content-child (same pattern as select).   |

## API Additions

```ts
// New inputs
readonly suggestions = input<(string | AsyncSelectOption<T>)[]>([]);
readonly asyncSearch = input<AsyncSearchFn<T> | null>(null);
readonly strict = input(false);
readonly minSearchLength = input(0);
readonly debounceTime = input(300);
```

- `AsyncSelectOption<T>` and `AsyncSearchFn<T>` re-used from `select` (already exported in `public-api.ts`).
- Raw strings in `suggestions` normalize internally to `{ label: s, value: s as T }`.
- `strict = false` (default) keeps the current Enter-to-create free-text flow.
- `strict = true` disables free-text creation; Enter only adds the focused suggestion.

Existing inputs (`variant`, `size`, `placeholder`, `label`, `hint`, `error`, `disabled`, `allowDuplicates`, `autoAdd`, `value`, `chipTemplate`) are unchanged.

## Internal State

```ts
protected readonly isOpen = signal(false);
protected readonly focusedIndex = signal(-1);
protected readonly asyncOptions = signal<AsyncSelectOption<T>[]>([]);
protected readonly asyncLoading = signal(false);
protected readonly asyncError = signal<string | null>(null);
private readonly labelCache = new Map<T, string>();
```

Plus async plumbing mirrored from select:
- `asyncSearchAbortController: AbortController | null`
- `debounceTimer: ReturnType<typeof setTimeout> | null`

## Derived State

`normalizedSuggestions = computed(...)` — maps `(string | AsyncSelectOption<T>)[]` into a uniform `AsyncSelectOption<T>[]`.

`isAsyncMode = computed(() => this.asyncSearch() !== null)`.

`visibleSuggestions = computed(...)`:
1. Source is `asyncOptions()` in async mode, else `normalizedSuggestions()`.
2. Filter out any entry whose `value` is already present in `value()` (hide-picked).
3. In static mode, filter by case-insensitive substring match against `inputValue()`.
4. In async mode, do not filter locally — the server is authoritative.

`exactMatchExists = computed(...)` — whether `inputValue()` matches a suggestion label exactly. Used to decide whether to show the "Create '<text>'" row.

## Behavior

### Opening / closing

- `onFocus()` → `open()` (sets `isOpen=true`, portals dropdown, resets `focusedIndex=-1`, kicks off async initial load if configured).
- `onBlur()` → schedule `close()` on a ~150ms timer so a click on a suggestion can land first. Cancel the scheduled close on mousedown within the dropdown.
- `Escape` → `close()` but keep `inputValue`.
- Selecting a suggestion → add chip, clear `inputValue`, keep dropdown open (so users can add several in a row); re-resolve focus on remaining visible list.

### Keyboard (`onInputKeydown`)

| Key         | Behavior                                                                                        |
|-------------|-------------------------------------------------------------------------------------------------|
| `Enter`     | If `focusedIndex >= 0`: add focused suggestion. Else if `!strict()` and text: free-text add. Else no-op. |
| `ArrowDown` | Move `focusedIndex` forward within `visibleSuggestions`, skipping disabled items.               |
| `ArrowUp`   | Move `focusedIndex` backward within `visibleSuggestions`, skipping disabled items.              |
| `Escape`    | Close dropdown (preserves `inputValue`).                                                        |
| `Backspace` | Existing behavior unchanged — remove last chip when input is empty.                             |

### Adding from a suggestion

`addSuggestion(option: AsyncSelectOption<T>)`:
1. Respect `allowDuplicates` (same check as `addChip`).
2. If `option.label !== String(option.value)`, `labelCache.set(option.value, option.label)`.
3. If `autoAdd()`, push `option.value` onto `value()`.
4. Clear `inputValue`, keep focus in input, recompute `focusedIndex` against the now-smaller visible list.
5. Emit `added` with `option.label` (so consumers see the same string shape they already handle) — **open question flagged below**.

### Async search

Mirror select's `triggerAsyncSearch` / `executeAsyncSearch`:
- Debounced by `debounceTime()`.
- Aborted via `AbortController` on each new keystroke.
- Short-circuits when `inputValue().trim().length < minSearchLength()`.
- Loading / error states rendered in the dropdown.

### Label cache

- Updated on suggestion add.
- Entry removed on `removeChip` (so stale labels don't linger when a value is re-used later as a free-text chip).
- `getChipDisplay(chip)` consults the cache first, falls back to `String(chip)`.

This keeps the two-way bound `value` array free of label metadata — consumers who `[(value)]="myTags"` still get plain `T[]`.

## Dropdown Rendering

Portal to `document.body` with fixed positioning under the chip container. Positioning helpers cloned from select (`portalDropdown`, `updateDropdownPosition`, `addPositionListeners`, `removePositionListeners`, `unportalDropdown`). Inlined into chip-input rather than extracted into a shared utility — see Approach note above.

Template structure (added after the existing `<input>`):

```
#dropdownRef .ui-chip-input__dropdown
  if (asyncMode)
    if (asyncLoading)   → spinner
    else if (asyncError) → error message
    else                → list of suggestions
  else
    → filtered static suggestions
  if (no matches) → "No results" empty state
  if (!strict && inputValue && !exactMatchExists) → "Create '<text>'" row
```

Each suggestion row:
- Rendered via `optionTemplate` (a `contentChild(OptionTemplateDirective)` reused from select) if provided, else the `label`.
- Classes: `.ui-chip-input__suggestion`, `--focused`, `--disabled`.
- `(mousedown)="$event.preventDefault()"` to avoid stealing focus before the click lands.

## Styles

Add to `chip-input.component.scss`:
- `.ui-chip-input__dropdown` — matches `.ui-select__dropdown` tokens (bg, border, radius, shadow).
- `.ui-chip-input__suggestion` + `--focused` / `--disabled`.
- `.ui-chip-input__create` — create row.
- `.ui-chip-input__loading`, `.ui-chip-input__error-message`, `.ui-chip-input__empty` — states.

Follow existing BEM + CSS-custom-property conventions.

## Public API

Export the following from `projects/ngx-ui/src/public-api.ts`:
- `AsyncSelectOption` and `AsyncSearchFn` — already exported via select; verify and leave as is.
- `OptionTemplateDirective` — already exported; reused by chip-input.

No new exports strictly required.

## Demo

Add a "Chip input with suggestions" section in `projects/demo/src/app/app.ts` showing:
1. Static suggestions, creatable (default).
2. Static suggestions, `strict = true`.
3. Async search example.
4. Custom `optionTemplate`.

## Out of Scope

- Content-child `<ui-option>` projection (explicitly skipped — see Decisions).
- Extracting a shared dropdown/portal utility used by both chip-input and select (deferred until a third consumer appears).
- Caching async results (`cacheAsyncResults` exists in select; not pulled over unless requested).
- Default options / initial options inputs from select (`defaultOptions`, `initialOptions`, `initialLoad`). Can be added later if needed.

## Open Question (flagged, to resolve in planning)

The existing `added` output emits `string`. When a suggestion with separate label/value is picked, is the emitted string the `label` or `String(value)`? Default proposal: emit `option.label` for user-facing consistency with the free-text path. Confirm during implementation planning.

## File Touch List

- `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts` — new inputs, state, methods.
- `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.html` — dropdown template block.
- `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.scss` — dropdown styles.
- `projects/demo/src/app/app.ts` — demo usage examples.
- `projects/ngx-ui/src/public-api.ts` — verify needed types are exported.
