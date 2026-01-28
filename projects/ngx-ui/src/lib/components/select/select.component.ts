import {
  Component,
  input,
  model,
  output,
  signal,
  computed,
  contentChildren,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  effect,
  HostListener,
  AfterContentInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OptionComponent } from './option.component';

export type SelectVariant = 'default' | 'outlined' | 'filled';
export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      class="ui-select-wrapper"
      [class.ui-select-wrapper--error]="error()"
      [class.ui-select-wrapper--disabled]="disabled()"
      [class.ui-select-wrapper--open]="isOpen()"
    >
      @if (label()) {
        <label class="ui-select__label">
          {{ label() }}
        </label>
      }

      <div
        class="ui-select__trigger"
        [class]="triggerClasses()"
        [attr.role]="'combobox'"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-disabled]="disabled()"
        [attr.tabindex]="disabled() ? -1 : 0"
        (click)="toggle()"
        (keydown)="handleTriggerKeydown($event)"
      >
        <span class="ui-select__value">
          @if (displayValue()) {
            {{ displayValue() }}
          } @else {
            <span class="ui-select__placeholder">{{ placeholder() }}</span>
          }
        </span>

        <div class="ui-select__icons">
          @if (clearable() && hasValue() && !disabled()) {
            <button
              type="button"
              class="ui-select__clear"
              (click)="clear($event)"
              aria-label="Clear selection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
          <svg
            class="ui-select__arrow"
            [class.ui-select__arrow--open]="isOpen()"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div
        class="ui-select__dropdown"
        [class.ui-select__dropdown--open]="isOpen()"
        [attr.role]="'listbox'"
        [attr.aria-multiselectable]="multiple()"
      >
        @if (searchable()) {
          <div class="ui-select__search">
            <input
              type="text"
              class="ui-select__search-input"
              placeholder="Search..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              (keydown)="handleSearchKeydown($event)"
              #searchInput
            />
          </div>
        }
        <div class="ui-select__options">
          <ng-content />
        </div>
      </div>

      @if (error()) {
        <span class="ui-select__error">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="ui-select__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    .ui-select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--ui-spacing-xs);
    }

    .ui-select__label {
      font-size: var(--ui-font-sm);
      font-weight: 500;
      color: var(--ui-text);
    }

    .ui-select__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ui-spacing-sm);
      width: 100%;
      background-color: var(--ui-bg);
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      cursor: pointer;
      transition: border-color var(--ui-transition-fast), box-shadow var(--ui-transition-fast);
    }

    .ui-select__trigger:hover:not([aria-disabled="true"]) {
      border-color: var(--ui-border-hover);
    }

    .ui-select__trigger:focus {
      outline: none;
      border-color: var(--ui-border-focus);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
    }

    .ui-select__trigger[aria-disabled="true"] {
      background-color: var(--ui-bg-secondary);
      color: var(--ui-text-disabled);
      cursor: not-allowed;
    }

    /* Sizes */
    .ui-select__trigger--sm {
      padding: var(--ui-spacing-xs) var(--ui-spacing-sm);
      font-size: var(--ui-font-sm);
    }

    .ui-select__trigger--md {
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      font-size: var(--ui-font-md);
    }

    .ui-select__trigger--lg {
      padding: var(--ui-spacing-md) var(--ui-spacing-lg);
      font-size: var(--ui-font-lg);
    }

    /* Variants */
    .ui-select__trigger--outlined {
      background-color: transparent;
    }

    .ui-select__trigger--filled {
      background-color: var(--ui-bg-secondary);
      border-color: transparent;
    }

    .ui-select__trigger--filled:hover:not([aria-disabled="true"]) {
      background-color: var(--ui-bg-tertiary);
    }

    .ui-select__trigger--filled:focus {
      border-color: var(--ui-border-focus);
    }

    .ui-select__value {
      flex: 1;
      min-width: 0;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ui-select__placeholder {
      color: var(--ui-text-muted);
    }

    .ui-select__icons {
      display: flex;
      align-items: center;
      gap: var(--ui-spacing-xs);
      flex-shrink: 0;
    }

    .ui-select__clear {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--ui-text-muted);
      border-radius: var(--ui-radius-sm);
      transition: color var(--ui-transition-fast), background-color var(--ui-transition-fast);
    }

    .ui-select__clear:hover {
      color: var(--ui-text);
      background-color: var(--ui-bg-hover);
    }

    .ui-select__arrow {
      color: var(--ui-text-muted);
      transition: transform var(--ui-transition-fast);
    }

    .ui-select__arrow--open {
      transform: rotate(180deg);
    }

    .ui-select__dropdown {
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
      visibility: hidden;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity var(--ui-transition-fast), transform var(--ui-transition-fast), visibility var(--ui-transition-fast);
    }

    .ui-select__dropdown--open {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
    }

    .ui-select__search {
      padding: var(--ui-spacing-sm);
      border-bottom: 1px solid var(--ui-border);
    }

    .ui-select__search-input {
      width: 100%;
      padding: var(--ui-spacing-xs) var(--ui-spacing-sm);
      font-family: inherit;
      font-size: var(--ui-font-sm);
      color: var(--ui-text);
      background-color: var(--ui-bg-secondary);
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-sm);
      outline: none;
    }

    .ui-select__search-input:focus {
      border-color: var(--ui-border-focus);
    }

    .ui-select__options {
      max-height: var(--ui-dropdown-max-height, 300px);
      overflow-y: auto;
    }

    .ui-select__empty {
      padding: var(--ui-spacing-md);
      text-align: center;
      color: var(--ui-text-muted);
      font-size: var(--ui-font-sm);
    }

    .ui-select-wrapper--error .ui-select__trigger {
      border-color: var(--ui-danger);
    }

    .ui-select-wrapper--error .ui-select__trigger:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-danger) 20%, transparent);
    }

    .ui-select__error {
      font-size: var(--ui-font-sm);
      color: var(--ui-danger);
    }

    .ui-select__hint {
      font-size: var(--ui-font-sm);
      color: var(--ui-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = unknown> implements AfterContentInit {
  // Inputs
  readonly variant = input<SelectVariant>('default');
  readonly size = input<SelectSize>('md');
  readonly placeholder = input('Select an option');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly multiple = input(false);
  readonly searchable = input(false);
  readonly clearable = input(false);

  // Two-way binding
  readonly value = model<T | T[] | null>(null);

  // Outputs
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly selectionChange = output<T | T[]>();

  // Content children
  readonly options = contentChildren(OptionComponent);

  // Internal state
  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly focusedIndex = signal(-1);

  private readonly elementRef = inject(ElementRef);

  constructor() {
    // Sync selected state to options
    effect(() => {
      const currentValue = this.value();
      const opts = this.options();
      const isMultiple = this.multiple();

      opts.forEach(opt => {
        opt.multiple.set(isMultiple);
        if (isMultiple && Array.isArray(currentValue)) {
          opt.selected.set(currentValue.includes(opt.value()));
        } else {
          opt.selected.set(opt.value() === currentValue);
        }
      });
    });

    // Sync focused state and visibility for search filtering
    effect(() => {
      const query = this.searchQuery().toLowerCase().trim();
      const index = this.focusedIndex();
      const opts = this.options();

      let visibleIndex = 0;
      opts.forEach(opt => {
        const label = opt.getLabel().toLowerCase();
        const isVisible = !query || label.includes(query);
        opt.elementRef.nativeElement.style.display = isVisible ? '' : 'none';

        if (isVisible) {
          opt.focused.set(visibleIndex === index);
          visibleIndex++;
        } else {
          opt.focused.set(false);
        }
      });
    });
  }

  ngAfterContentInit(): void {
    // Set up click handlers on options
    this.options().forEach(opt => {
      opt.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
        this.selectOption(opt, event);
      });
    });
  }

  protected readonly triggerClasses = computed(() => {
    return `ui-select__trigger--${this.variant()} ui-select__trigger--${this.size()}`;
  });

  protected readonly hasValue = computed(() => {
    const val = this.value();
    if (this.multiple()) {
      return Array.isArray(val) && val.length > 0;
    }
    return val !== null && val !== undefined;
  });

  protected readonly displayValue = computed(() => {
    const val = this.value();
    const opts = this.options();

    if (this.multiple() && Array.isArray(val)) {
      if (val.length === 0) return '';
      const labels = val.map(v => {
        const opt = opts.find(o => o.value() === v);
        return opt?.getLabel() || String(v);
      });
      return labels.join(', ');
    }

    if (val === null || val === undefined) return '';
    const opt = opts.find(o => o.value() === val);
    return opt?.getLabel() || String(val);
  });

  protected readonly visibleOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const opts = this.options();

    if (!query) return [...opts];

    return opts.filter(opt => {
      const label = opt.getLabel().toLowerCase();
      return label.includes(query);
    });
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.searchQuery.set('');
    this.focusedIndex.set(-1);
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.focusedIndex.set(-1);
    this.closed.emit();
  }

  selectOption(option: OptionComponent<T>, event?: MouseEvent): void {
    event?.stopPropagation();

    if (option.disabled()) return;

    const optionValue = option.value();
    if (optionValue === null) return;

    if (this.multiple()) {
      const currentValue = (this.value() as T[]) || [];
      const index = currentValue.indexOf(optionValue);

      let newValue: T[];
      if (index === -1) {
        newValue = [...currentValue, optionValue];
      } else {
        newValue = currentValue.filter((_, i) => i !== index);
      }

      this.value.set(newValue);
      this.selectionChange.emit(newValue);
    } else {
      this.value.set(optionValue);
      this.selectionChange.emit(optionValue);
      this.close();
    }
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.multiple()) {
      this.value.set([]);
      this.selectionChange.emit([]);
    } else {
      this.value.set(null);
    }
  }

  protected handleTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          const focused = this.visibleOptions()[this.focusedIndex()];
          if (focused) {
            this.selectOption(focused);
          }
        } else {
          this.open();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          this.focusNext();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.focusPrevious();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  protected handleSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'Enter':
        event.preventDefault();
        const focused = this.visibleOptions()[this.focusedIndex()];
        if (focused) {
          this.selectOption(focused);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private focusNext(): void {
    const opts = this.visibleOptions();
    const current = this.focusedIndex();
    let next = current + 1;

    while (next < opts.length && opts[next].disabled()) {
      next++;
    }

    if (next < opts.length) {
      this.focusedIndex.set(next);
      this.scrollToFocused();
    }
  }

  private focusPrevious(): void {
    const opts = this.visibleOptions();
    const current = this.focusedIndex();
    let prev = current - 1;

    while (prev >= 0 && opts[prev].disabled()) {
      prev--;
    }

    if (prev >= 0) {
      this.focusedIndex.set(prev);
      this.scrollToFocused();
    }
  }

  private scrollToFocused(): void {
    const focused = this.visibleOptions()[this.focusedIndex()];
    if (focused) {
      focused.elementRef.nativeElement.scrollIntoView({ block: 'nearest' });
    }
  }
}
