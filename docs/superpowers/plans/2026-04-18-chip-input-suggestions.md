# Chip Input Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add static-array and async-search suggestions to `ui-chip-input`, with a focus-triggered dropdown, keyboard navigation, hide-already-picked behavior, optional strict mode, and a label cache that preserves the current chip `T[]` shape.

**Architecture:** Extend `chip-input.component.ts` directly. Reuse `AsyncSelectOption<T>`, `AsyncSearchFn<T>`, and `OptionTemplateDirective` from select. Clone select's dropdown portal / positioning code into chip-input (inlined, not shared — no third consumer yet).

**Tech Stack:** Angular 21+ signals (`input`, `model`, `signal`, `computed`, `contentChild`), standalone component, OnPush, CSS custom properties, `ng-packagr`, yarn.

**Spec reference:** `docs/superpowers/specs/2026-04-18-chip-input-suggestions-design.md`

**Verification convention:** This library has no component unit tests. After each task, run `yarn build:lib` to catch type errors; after UI-affecting tasks, visually verify in the demo app (`yarn start`). Follow this convention — do not introduce Vitest component tests.

---

## File Touch List

- **Modify:** `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`
- **Modify:** `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.html`
- **Modify:** `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.scss`
- **Modify:** `projects/demo/src/app/app.ts` (add usage examples)

No new files. `public-api.ts` already exports `AsyncSelectOption`, `AsyncSearchFn`, and `OptionTemplateDirective` via select.

---

### Task 1: Add new inputs, state, and derived signals to the component class

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`

- [ ] **Step 1: Extend imports and add new inputs/state at the top of the class**

At the top of `chip-input.component.ts`, replace the existing `import` block with:

```ts
import {
  Component,
  Directive,
  input,
  model,
  output,
  signal,
  computed,
  contentChild,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  TemplateRef,
  inject,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { AsyncSearchFn, AsyncSelectOption } from '../select/select.component';
import { OptionTemplateDirective } from '../select/option-template.directive';
```

Update the `@Component` decorator's `imports` array to include `NgTemplateOutlet` (already present) — no change.

- [ ] **Step 2: Update the class signature to implement `OnDestroy` and add new inputs**

Change the class declaration from:

```ts
export class ChipInputComponent<T = string> {
```

to:

```ts
export class ChipInputComponent<T = string> implements OnDestroy {
```

Immediately after the existing `readonly autoAdd = input(true);` line, add:

```ts
  readonly suggestions = input<(string | AsyncSelectOption<T>)[]>([]);
  readonly asyncSearch = input<AsyncSearchFn<T> | null>(null);
  readonly strict = input(false);
  readonly minSearchLength = input(0);
  readonly debounceTime = input(300);
```

- [ ] **Step 3: Add `optionTemplate` content-child alongside the existing `chipTemplate`**

Directly after the existing `chipTemplate` line:

```ts
  readonly chipTemplate = contentChild(ChipTemplateDirective, { read: TemplateRef });
```

add:

```ts
  readonly optionTemplate = contentChild(OptionTemplateDirective);
```

- [ ] **Step 4: Add `triggerRef` and `dropdownRef` view children, plus new protected signals**

Inside the class, directly after the existing `@ViewChild('inputRef')` line, add:

```ts
  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownRef', { static: true }) dropdownRef!: ElementRef<HTMLElement>;
```

Then replace the block:

```ts
  protected readonly inputValue = signal('');
  protected readonly isFocused = signal(false);
```

with:

```ts
  protected readonly inputValue = signal('');
  protected readonly isFocused = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly focusedIndex = signal(-1);
  protected readonly asyncOptions = signal<AsyncSelectOption<T>[]>([]);
  protected readonly asyncLoading = signal(false);
  protected readonly asyncError = signal<string | null>(null);

  private readonly labelCache = new Map<T, string>();
  private readonly elementRef = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private asyncSearchAbortController: AbortController | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private blurCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private positionCleanup: (() => void) | null = null;
```

- [ ] **Step 5: Add `ngOnDestroy` and derived computed signals**

Directly after the existing `containerClasses` computed, add:

```ts
  protected readonly isAsyncMode = computed(() => this.asyncSearch() !== null);

  protected readonly normalizedSuggestions = computed<AsyncSelectOption<T>[]>(() => {
    return this.suggestions().map((s) =>
      typeof s === 'string' ? { label: s, value: s as unknown as T } : s,
    );
  });

  protected readonly visibleSuggestions = computed<AsyncSelectOption<T>[]>(() => {
    const source = this.isAsyncMode() ? this.asyncOptions() : this.normalizedSuggestions();
    const selected = this.value();
    const query = this.inputValue().toLowerCase().trim();

    const notPicked = source.filter((opt) => !selected.includes(opt.value));
    if (this.isAsyncMode()) return notPicked;
    if (!query) return notPicked;
    return notPicked.filter((opt) => opt.label.toLowerCase().includes(query));
  });

  protected readonly exactMatchExists = computed(() => {
    const query = this.inputValue().toLowerCase().trim();
    if (!query) return true;
    const source = this.isAsyncMode() ? this.asyncOptions() : this.normalizedSuggestions();
    return source.some((opt) => opt.label.toLowerCase() === query);
  });

  protected readonly showCreateRow = computed(() => {
    return (
      !this.strict() &&
      this.inputValue().trim().length > 0 &&
      !this.exactMatchExists()
    );
  });

  ngOnDestroy(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (dropdown?.parentElement === this.document.body) {
      this.document.body.removeChild(dropdown);
    }
    this.removePositionListeners();
    this.cancelAsyncSearch();
    if (this.blurCloseTimer) {
      clearTimeout(this.blurCloseTimer);
      this.blurCloseTimer = null;
    }
  }
```

- [ ] **Step 6: Update `getChipDisplay` to consult the label cache**

Replace:

```ts
  protected getChipDisplay(chip: T): string {
    return String(chip);
  }
```

with:

```ts
  protected getChipDisplay(chip: T): string {
    return this.labelCache.get(chip) ?? String(chip);
  }
```

- [ ] **Step 7: Build the library to confirm types**

Run: `yarn build:lib`
Expected: build succeeds. No TypeScript errors. (HTML still references unchanged DOM; template updates come in a later task — state and computed are declared but unused, which is fine in a library build.)

- [ ] **Step 8: Commit**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts
git commit -m "chip-input: add suggestion inputs, state, and derived signals"
```

---

### Task 2: Port dropdown portal + positioning from select into chip-input

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`

- [ ] **Step 1: Add the open/close/portal methods to the class**

Append the following methods at the bottom of the `ChipInputComponent` class, directly before the final closing brace:

```ts
  protected open(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.focusedIndex.set(-1);
    this.portalDropdown();
    if (this.isAsyncMode()) {
      this.triggerAsyncSearch(this.inputValue());
    }
  }

  protected close(): void {
    if (!this.isOpen()) return;
    this.unportalDropdown();
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.cancelAsyncSearch();
    this.asyncLoading.set(false);
    this.asyncError.set(null);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.dropdownRef?.nativeElement?.contains(target)
    ) {
      this.close();
    }
  }

  private portalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;
    dropdown.style.display = 'block';
    this.document.body.appendChild(dropdown);
    this.updateDropdownPosition();
    this.addPositionListeners();
  }

  private unportalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;
    if (dropdown.parentElement === this.document.body) {
      const wrapper = this.elementRef.nativeElement.querySelector('.ui-chip-input-wrapper');
      if (wrapper) wrapper.appendChild(dropdown);
    }
    dropdown.style.display = '';
    dropdown.style.position = '';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.bottom = '';
    dropdown.style.width = '';
    dropdown.style.zIndex = '';
    dropdown.style.margin = '';
    this.removePositionListeners();
  }

  private updateDropdownPosition(): void {
    const trigger = this.triggerRef?.nativeElement;
    const dropdown = this.dropdownRef?.nativeElement;
    if (!trigger || !dropdown) return;
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownHeight = dropdown.scrollHeight;
    const gap = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const openAbove = spaceBelow < dropdownHeight + gap && spaceAbove > spaceBelow;

    dropdown.style.position = 'fixed';
    dropdown.style.width = `${triggerRect.width}px`;
    dropdown.style.left = `${triggerRect.left}px`;
    dropdown.style.zIndex = '99999';
    dropdown.style.margin = '0';

    if (openAbove) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = `${window.innerHeight - triggerRect.top + gap}px`;
    } else {
      dropdown.style.top = `${triggerRect.bottom + gap}px`;
      dropdown.style.bottom = 'auto';
    }
  }

  private addPositionListeners(): void {
    const update = () => {
      if (this.isOpen()) this.updateDropdownPosition();
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    this.positionCleanup = () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }

  private removePositionListeners(): void {
    this.positionCleanup?.();
    this.positionCleanup = null;
  }
```

- [ ] **Step 2: Build the library**

Run: `yarn build:lib`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts
git commit -m "chip-input: add dropdown portal and positioning"
```

---

### Task 3: Wire up focus/blur behavior and add `addSuggestion` with label cache

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`

- [ ] **Step 1: Replace `onFocus` and `onBlur`**

Replace:

```ts
  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
  }
```

with:

```ts
  protected onFocus(): void {
    this.isFocused.set(true);
    if (this.blurCloseTimer) {
      clearTimeout(this.blurCloseTimer);
      this.blurCloseTimer = null;
    }
    this.open();
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.blurCloseTimer = setTimeout(() => {
      this.close();
      this.blurCloseTimer = null;
    }, 150);
  }

  protected onDropdownMousedown(event: MouseEvent): void {
    event.preventDefault();
    if (this.blurCloseTimer) {
      clearTimeout(this.blurCloseTimer);
      this.blurCloseTimer = null;
    }
  }
```

The 150ms delay matches the standard pattern in select-style components: long enough for a suggestion click to land before the blur-driven close runs, short enough to feel instantaneous.

- [ ] **Step 2: Add `addSuggestion` method and update `removeChip` to clear the cache**

Directly after the existing `removeChip` method, replace:

```ts
  removeChip(chipValue: T): void {
    this.value.set(this.value().filter((v) => v !== chipValue));
    this.removed.emit(chipValue);
    setTimeout(() => this.inputRef?.nativeElement?.focus());
  }
```

with:

```ts
  removeChip(chipValue: T): void {
    this.value.set(this.value().filter((v) => v !== chipValue));
    this.labelCache.delete(chipValue);
    this.removed.emit(chipValue);
    setTimeout(() => this.inputRef?.nativeElement?.focus());
  }

  protected addSuggestion(option: AsyncSelectOption<T>): void {
    if (option.disabled) return;
    const current = this.value();
    if (!this.allowDuplicates() && current.includes(option.value)) return;
    if (option.label !== String(option.value)) {
      this.labelCache.set(option.value, option.label);
    }
    if (this.autoAdd()) {
      this.value.set([...current, option.value]);
    }
    this.inputValue.set('');
    this.added.emit(option.label);
    this.focusedIndex.set(-1);
    setTimeout(() => {
      this.updateDropdownPosition();
      this.inputRef?.nativeElement?.focus();
    });
  }
```

- [ ] **Step 3: Build the library**

Run: `yarn build:lib`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts
git commit -m "chip-input: focus-opens-dropdown, addSuggestion, label cache"
```

---

### Task 4: Replace `onInputKeydown` with suggestion-aware keyboard handling

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`

- [ ] **Step 1: Replace the keydown handler**

Replace the existing `onInputKeydown` method:

```ts
  protected onInputKeydown(event: KeyboardEvent): void {
    const value = this.inputValue().trim();

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (value) {
          this.addChip(value);
        }
        break;
      case 'Backspace':
        if (!value && this.value().length > 0) {
          this.removeChip(this.value()[this.value().length - 1]);
        }
        break;
    }
  }
```

with:

```ts
  protected onInputKeydown(event: KeyboardEvent): void {
    const trimmed = this.inputValue().trim();

    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const focused = this.focusedIndex();
        const visible = this.visibleSuggestions();
        if (focused >= 0 && focused < visible.length) {
          this.addSuggestion(visible[focused]);
        } else if (!this.strict() && trimmed) {
          this.addChip(trimmed);
          setTimeout(() => this.updateDropdownPosition());
        }
        break;
      }
      case 'ArrowDown': {
        if (!this.isOpen()) {
          this.open();
          return;
        }
        event.preventDefault();
        const visible = this.visibleSuggestions();
        let next = this.focusedIndex() + 1;
        while (next < visible.length && visible[next].disabled) next++;
        if (next < visible.length) this.focusedIndex.set(next);
        break;
      }
      case 'ArrowUp': {
        if (!this.isOpen()) return;
        event.preventDefault();
        const visible = this.visibleSuggestions();
        let prev = this.focusedIndex() - 1;
        while (prev >= 0 && visible[prev].disabled) prev--;
        if (prev >= 0) this.focusedIndex.set(prev);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Backspace':
        if (!trimmed && this.value().length > 0) {
          this.removeChip(this.value()[this.value().length - 1]);
        }
        break;
    }
  }
```

- [ ] **Step 2: Add an input handler to reset `focusedIndex` and trigger async search on typing**

Add this new method directly after `onInputKeydown`:

```ts
  protected onInputChange(value: string): void {
    this.inputValue.set(value);
    this.focusedIndex.set(-1);
    if (!this.isOpen()) this.open();
    if (this.isAsyncMode()) {
      this.triggerAsyncSearch(value);
    } else {
      setTimeout(() => this.updateDropdownPosition());
    }
  }
```

- [ ] **Step 3: Build the library**

Run: `yarn build:lib`
Expected: build succeeds. (`triggerAsyncSearch` is added in the next task — if build fails here because of the missing method, complete Task 5 first and then re-run the build. To avoid that, proceed straight to Task 5 before committing.)

---

### Task 5: Implement async search (debounce, abort, error state)

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts`

- [ ] **Step 1: Add async search methods**

Append at the bottom of the class (before the final closing brace):

```ts
  private triggerAsyncSearch(query: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.asyncSearchAbortController) {
      this.asyncSearchAbortController.abort();
      this.asyncSearchAbortController = null;
    }

    const trimmed = query.trim();
    if (trimmed.length < this.minSearchLength()) {
      this.asyncOptions.set([]);
      this.asyncLoading.set(false);
      this.asyncError.set(null);
      this.focusedIndex.set(-1);
      return;
    }

    this.asyncLoading.set(true);
    this.asyncError.set(null);

    this.debounceTimer = setTimeout(() => {
      this.executeAsyncSearch(trimmed);
    }, this.debounceTime());
  }

  private async executeAsyncSearch(query: string): Promise<void> {
    const searchFn = this.asyncSearch();
    if (!searchFn) return;

    this.asyncSearchAbortController = new AbortController();
    const signal = this.asyncSearchAbortController.signal;

    try {
      const results = await searchFn(query);
      if (signal.aborted) return;
      this.asyncOptions.set(results);
      this.asyncLoading.set(false);
      this.asyncError.set(null);
      this.focusedIndex.set(-1);
      setTimeout(() => this.updateDropdownPosition());
    } catch (error) {
      if (signal.aborted) return;
      this.asyncOptions.set([]);
      this.asyncLoading.set(false);
      this.asyncError.set(error instanceof Error ? error.message : 'Search failed');
      this.focusedIndex.set(-1);
    }
  }

  private cancelAsyncSearch(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.asyncSearchAbortController) {
      this.asyncSearchAbortController.abort();
      this.asyncSearchAbortController = null;
    }
  }
```

- [ ] **Step 2: Build the library**

Run: `yarn build:lib`
Expected: build succeeds. No unresolved references.

- [ ] **Step 3: Commit (covers Tasks 4 and 5 together)**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.ts
git commit -m "chip-input: suggestion-aware keyboard nav and async search"
```

---

### Task 6: Update the template with dropdown markup

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.html`

- [ ] **Step 1: Replace the entire template file**

Overwrite `chip-input.component.html` with:

```html
<div class="ui-chip-input-wrapper">
  @if (label()) {
    <label class="ui-chip-input__label">{{ label() }}</label>
  }

  <div
    #triggerRef
    class="ui-chip-input"
    [class]="containerClasses()"
    (click)="onContainerClick()"
  >
    @for (chip of value(); track chip) {
      @if (chipTemplate()) {
        <ng-container
          [ngTemplateOutlet]="chipTemplate()!"
          [ngTemplateOutletContext]="getChipContext(chip)"
        />
      } @else {
        <span class="ui-chip-input__chip">
          <span class="ui-chip-input__chip-text">{{ getChipDisplay(chip) }}</span>
          @if (!disabled()) {
            <button
              type="button"
              class="ui-chip-input__chip-remove"
              (click)="removeChip(chip); $event.stopPropagation()"
              aria-label="Remove"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </span>
      }
    }
    <input
      #inputRef
      type="text"
      class="ui-chip-input__input"
      [placeholder]="value().length === 0 ? placeholder() : ''"
      [disabled]="disabled()"
      [value]="inputValue()"
      (input)="onInputChange($any($event.target).value)"
      (keydown)="onInputKeydown($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
      autocomplete="off"
    />
  </div>

  <div
    #dropdownRef
    class="ui-chip-input__dropdown"
    [class.ui-chip-input__dropdown--open]="isOpen()"
    [attr.role]="'listbox'"
    (mousedown)="onDropdownMousedown($event)"
  >
    <div class="ui-chip-input__options">
      @if (isAsyncMode() && asyncLoading()) {
        <div class="ui-chip-input__loading">
          <svg class="ui-chip-input__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <span>Searching...</span>
        </div>
      } @else if (isAsyncMode() && asyncError()) {
        <div class="ui-chip-input__error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ asyncError() }}</span>
        </div>
      } @else {
        @for (option of visibleSuggestions(); track option.value; let i = $index) {
          <div
            class="ui-chip-input__suggestion"
            [class.ui-chip-input__suggestion--focused]="focusedIndex() === i"
            [class.ui-chip-input__suggestion--disabled]="option.disabled"
            [attr.role]="'option'"
            [attr.aria-disabled]="option.disabled"
            (click)="addSuggestion(option)"
          >
            @if (optionTemplate(); as tpl) {
              <ng-container
                [ngTemplateOutlet]="tpl.templateRef"
                [ngTemplateOutletContext]="{ $implicit: option.value, option: option.value, selected: false, disabled: !!option.disabled }"
              />
            } @else {
              <span class="ui-chip-input__suggestion-label">{{ option.label }}</span>
            }
          </div>
        }
        @if (visibleSuggestions().length === 0 && !showCreateRow()) {
          @if (isAsyncMode() && inputValue().trim().length < minSearchLength() && minSearchLength() > 0) {
            <div class="ui-chip-input__empty">Type at least {{ minSearchLength() }} characters to search</div>
          } @else {
            <div class="ui-chip-input__empty">No suggestions</div>
          }
        }
      }
    </div>
    @if (showCreateRow()) {
      <div
        class="ui-chip-input__create"
        (click)="addChip(inputValue().trim())"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Create "{{ inputValue().trim() }}"
      </div>
    }
  </div>

  @if (error()) {
    <span class="ui-chip-input__error">{{ error() }}</span>
  }
  @if (hint() && !error()) {
    <span class="ui-chip-input__hint">{{ hint() }}</span>
  }
</div>
```

Notes:
- The `#triggerRef` moved onto the `.ui-chip-input` container (the visible trigger).
- Input uses `[value]` + `(input)` instead of `[(ngModel)]` so the signal-based `onInputChange` handler runs on every keystroke.
- The create row calls the existing `addChip` method (which already handles the free-text path and clears `inputValue`).

- [ ] **Step 2: Build the library**

Run: `yarn build:lib`
Expected: build succeeds. Template parses.

- [ ] **Step 3: Commit**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.html
git commit -m "chip-input: dropdown template with suggestions, loading, create row"
```

---

### Task 7: Add dropdown styles

**Files:**
- Modify: `projects/ngx-ui/src/lib/components/chip-input/chip-input.component.scss`

- [ ] **Step 1: Append dropdown styles**

Append to the end of `chip-input.component.scss`:

```scss
.ui-chip-input__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: var(--ui-spacing-xs);
  background-color: var(--ui-dropdown-bg, var(--ui-bg));
  border: 1px solid var(--ui-dropdown-border, var(--ui-border));
  border-radius: var(--ui-dropdown-radius, var(--ui-radius-md));
  box-shadow: var(--ui-dropdown-shadow, var(--ui-shadow-lg));
  overflow: hidden;
  display: none;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity var(--ui-transition-fast), transform var(--ui-transition-fast);
  box-sizing: border-box;
}

.ui-chip-input__dropdown--open {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.ui-chip-input__options {
  max-height: var(--ui-dropdown-max-height, 300px);
  overflow-y: auto;
}

.ui-chip-input__suggestion {
  display: flex;
  align-items: center;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-sm) var(--ui-spacing-md);
  cursor: pointer;
  transition: background-color var(--ui-transition-fast);
}

.ui-chip-input__suggestion:hover:not(.ui-chip-input__suggestion--disabled) {
  background-color: var(--ui-bg-hover);
}

.ui-chip-input__suggestion--focused {
  background-color: var(--ui-bg-hover);
  outline: none;
}

.ui-chip-input__suggestion--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-chip-input__suggestion-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-chip-input__create {
  display: flex;
  align-items: center;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-sm) var(--ui-spacing-md);
  font-size: 0.875rem;
  color: var(--ui-primary);
  cursor: pointer;
  border-top: 1px solid var(--ui-border);
  transition: background-color var(--ui-transition-fast);
}

.ui-chip-input__create:hover {
  background-color: var(--ui-bg-hover);
}

.ui-chip-input__empty {
  padding: var(--ui-spacing-md);
  text-align: center;
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}

.ui-chip-input__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-lg) var(--ui-spacing-md);
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}

.ui-chip-input__spinner {
  animation: ui-chip-input-spin 1s linear infinite;
}

@keyframes ui-chip-input-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ui-chip-input__error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-md);
  color: var(--ui-danger);
  font-size: 0.875rem;
}
```

- [ ] **Step 2: Build the library**

Run: `yarn build:lib`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add projects/ngx-ui/src/lib/components/chip-input/chip-input.component.scss
git commit -m "chip-input: dropdown styles"
```

---

### Task 8: Add demo examples

**Files:**
- Modify: `projects/demo/src/app/app.ts`

- [ ] **Step 1: Locate the existing chip-input demo section**

Run: `grep -n "ui-chip-input" projects/demo/src/app/app.ts`

Identify the block that demonstrates `ui-chip-input`. New examples will be added directly after it in the template string, with their state added to the component class.

- [ ] **Step 2: Add four new examples in the chip-input demo section**

Add four new `<ui-chip-input>` blocks to the template string, after the existing chip-input example:

```html
<h3>Chip input with static suggestions (creatable)</h3>
<ui-chip-input
  [(value)]="chipTagsCreatable"
  [suggestions]="['angular', 'typescript', 'signals', 'rxjs', 'vitest']"
  label="Tags"
  placeholder="Add or pick a tag..."
/>

<h3>Chip input strict (suggestions only)</h3>
<ui-chip-input
  [(value)]="chipTagsStrict"
  [suggestions]="['red', 'green', 'blue', 'yellow', 'purple']"
  [strict]="true"
  label="Color"
  placeholder="Pick a color..."
/>

<h3>Chip input with async search</h3>
<ui-chip-input
  [(value)]="chipTagsAsync"
  [asyncSearch]="userSearch"
  [minSearchLength]="2"
  label="Users"
  placeholder="Search users..."
/>

<h3>Chip input with custom option template</h3>
<ui-chip-input
  [(value)]="chipTagsCustom"
  [suggestions]="colorOptions"
  label="Colors"
  placeholder="Pick a color..."
>
  <ng-template uiOptionTemplate let-color>
    <span style="display:inline-block;width:12px;height:12px;border-radius:2px;margin-right:8px" [style.background]="color"></span>
    <span>{{ color }}</span>
  </ng-template>
</ui-chip-input>
```

In the component class, add these fields (place them near the existing chip-input state fields):

```ts
  chipTagsCreatable: string[] = [];
  chipTagsStrict: string[] = [];
  chipTagsAsync: string[] = [];
  chipTagsCustom: string[] = [];
  colorOptions = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' },
  ];

  userSearch = async (query: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const pool = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank'];
    return pool
      .filter((u) => u.toLowerCase().includes(query.toLowerCase()))
      .map((u) => ({ label: u, value: u }));
  };
```

If `OptionTemplateDirective` is not already in the `imports` array of the demo component, add it. The existing import line for ngx-ui items looks something like:

```ts
import { ChipInputComponent, ... } from '@m1z23r/ngx-ui';
```

Add `OptionTemplateDirective` to that import list, then add it to the component's `imports` array.

- [ ] **Step 3: Run the demo and visually verify**

Run: `yarn start`

In the browser (http://localhost:4200), scroll to the chip-input section and verify each new example:

1. **Creatable static:** Focusing the input opens a dropdown of all 5 tags. Typing filters the list. Clicking a suggestion adds it as a chip and removes it from the dropdown. Typing a new value not in the list and pressing Enter (or clicking the "Create ..." row) creates a free-text chip.
2. **Strict:** Focusing opens the dropdown. Typing a value not in the list shows "No suggestions". Pressing Enter with no focused suggestion does nothing. No "Create" row appears.
3. **Async:** Focusing opens an empty dropdown saying "Type at least 2 characters to search". Typing `al` triggers a 400ms delay then shows `alice`. Picking it adds a chip.
4. **Custom template:** Focusing shows rows with colored squares. Picked chips show the `value` (e.g., `red`), not the label — this is expected because `colorOptions` has `label: 'Red', value: 'red'` and `getChipDisplay` returns the label via the cache. Verify that the chip shows "Red" (capitalized), confirming the label cache path works.

Also verify that existing chip-input examples still work (free-text only, custom chip template).

- [ ] **Step 4: Commit**

```bash
git add projects/demo/src/app/app.ts
git commit -m "demo: chip-input suggestions examples"
```

---

### Task 9: Final verification

**Files:** no code changes.

- [ ] **Step 1: Clean build**

Run: `yarn build:lib`
Expected: build succeeds, no warnings specific to chip-input.

- [ ] **Step 2: Full demo smoke test**

With `yarn start` running, click through all chip-input examples plus a handful of unrelated components (select, input, button) to confirm no regression in the library.

- [ ] **Step 3: Review final diff**

Run: `git log --oneline origin/main..HEAD`
Expected: 7 commits matching Tasks 1, 2, 3, 5, 6, 7, 8 (Task 4 was folded into the Task 5 commit).

Run: `git diff origin/main..HEAD -- projects/ngx-ui/src/lib/components/chip-input`
Verify no leftover debugging `console.log`, commented-out code, or placeholder strings.

- [ ] **Step 4: No commit required.** If everything passes, the plan is complete.
