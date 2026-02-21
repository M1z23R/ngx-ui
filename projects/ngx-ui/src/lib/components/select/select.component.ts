import {
  Component,
  input,
  model,
  output,
  signal,
  computed,
  contentChildren,
  contentChild,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  effect,
  HostListener,
  AfterContentInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { OptionComponent } from './option.component';
import { OptionTemplateDirective } from './option-template.directive';

export type SelectVariant = 'default' | 'outlined' | 'filled';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface AsyncSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

export type AsyncSearchFn<T> = (query: string) => Promise<AsyncSelectOption<T>[]>;

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = unknown> implements AfterContentInit, OnDestroy {
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
  readonly creatable = input(false);
  readonly deletable = input(false);
  readonly selectable = input(true);

  // Async search inputs
  readonly asyncSearch = input<AsyncSearchFn<T> | null>(null);
  readonly debounceTime = input(300);
  readonly minSearchLength = input(0);

  // Two-way binding
  readonly value = model<T | T[] | null>(null);

  // Outputs
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly created = output<string>();
  readonly deleted = output<T>();

  // Content children
  readonly options = contentChildren(OptionComponent);
  readonly optionTemplate = contentChild(OptionTemplateDirective);

  // View children for dropdown portal
  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownRef', { static: true }) dropdownRef!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  // Internal state
  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly focusedIndex = signal(-1);

  // Async state
  readonly asyncLoading = signal(false);
  readonly asyncOptions = signal<AsyncSelectOption<T>[]>([]);
  readonly asyncError = signal<string | null>(null);
  private asyncSearchAbortController: AbortController | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly elementRef = inject(ElementRef);
  private positionCleanup: (() => void) | null = null;
  private readonly initializedOptions = new WeakSet<OptionComponent<T>>();

  constructor() {
    // Sync selected state to options
    effect(() => {
      const currentValue = this.value();
      const opts = this.options();
      const isMultiple = this.multiple();
      const isDeletable = this.deletable();

      opts.forEach((opt) => {
        opt.multiple.set(isMultiple);
        opt.deletable.set(isDeletable);
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
      opts.forEach((opt) => {
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

    // Set up handlers when options change (for dynamically added options)
    effect(() => {
      this.options(); // track changes
      this.setupOptionHandlers();
    });
  }

  ngAfterContentInit(): void {
    // Initial setup handled by effect
  }

  private setupOptionHandlers(): void {
    // Set up click handlers on new options
    this.options().forEach((opt) => {
      if (this.initializedOptions.has(opt)) return;
      this.initializedOptions.add(opt);

      opt.elementRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
        this.selectOption(opt, event);
      });
      opt.deleteClicked.subscribe((value: T) => {
        this.deleteOption(value);
      });
    });
  }

  ngOnDestroy(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (dropdown?.parentElement === document.body) {
      document.body.removeChild(dropdown);
    }
    this.removePositionListeners();
    this.cancelAsyncSearch();
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
    const asyncOpts = this.asyncOptions();
    const isAsync = this.isAsyncMode();

    if (this.multiple() && Array.isArray(val)) {
      if (val.length === 0) return '';
      const labels = val.map((v) => {
        if (isAsync) {
          const asyncOpt = asyncOpts.find((o) => o.value === v);
          if (asyncOpt) return asyncOpt.label;
        }
        const opt = opts.find((o) => o.value() === v);
        return opt?.getLabel() || String(v);
      });
      return labels.join(', ');
    }

    if (val === null || val === undefined) return '';

    if (isAsync) {
      const asyncOpt = asyncOpts.find((o) => o.value === val);
      if (asyncOpt) return asyncOpt.label;
    }
    const opt = opts.find((o) => o.value() === val);
    return opt?.getLabel() || String(val);
  });

  protected readonly inputPlaceholder = computed(() => {
    if (!this.selectable()) {
      const opts = this.options();
      const labels = opts.map((o) => o.getLabel());
      if (labels.length > 0) {
        return `${labels.join(', ')}, (${this.placeholder()})`;
      }
    }
    return this.displayValue() || this.placeholder();
  });

  protected readonly isAsyncMode = computed(() => this.asyncSearch() !== null);

  protected readonly visibleOptions = computed(() => {
    // In async mode, don't filter content children - they're not used
    if (this.isAsyncMode()) return [];

    const query = this.searchQuery().toLowerCase().trim();
    const opts = this.options();

    if (!query) return [...opts];

    return opts.filter((opt) => {
      const label = opt.getLabel().toLowerCase();
      return label.includes(query);
    });
  });

  protected readonly visibleAsyncOptions = computed(() => {
    if (!this.isAsyncMode()) return [];
    return this.asyncOptions();
  });

  protected readonly exactMatchExists = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return true;

    if (this.isAsyncMode()) {
      return this.asyncOptions().some((opt) => opt.label.toLowerCase() === query);
    }
    return this.options().some((opt) => opt.getLabel().toLowerCase() === query);
  });

  protected readonly totalVisibleCount = computed(() => {
    if (this.isAsyncMode()) {
      return this.visibleAsyncOptions().length;
    }
    return this.visibleOptions().length;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.dropdownRef?.nativeElement?.contains(target)
    ) {
      this.close();
    }
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.searchable()) {
      // In combobox mode, clicking trigger always opens
      if (!this.isOpen()) {
        this.open();
      }
    } else {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  open(): void {
    if (this.disabled() || this.isOpen()) return;
    this.isOpen.set(true);
    this.searchQuery.set('');
    this.focusedIndex.set(-1);
    this.opened.emit();
    this.portalDropdown();

    if (this.searchable()) {
      setTimeout(() => {
        const input = this.searchInputRef?.nativeElement;
        if (input) {
          input.focus();
          // Only select if there's text to select, avoids racing with user input
          if (input.value) {
            input.select();
          }
        }
      });
    }
  }

  close(): void {
    if (!this.isOpen()) return;
    this.unportalDropdown();
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.focusedIndex.set(-1);
    this.closed.emit();

    // Clean up async state
    this.cancelAsyncSearch();
    this.asyncLoading.set(false);
    this.asyncError.set(null);
    // Keep asyncOptions so displayValue still works after selection
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

  selectOption(option: OptionComponent<T>, event?: MouseEvent): void {
    event?.stopPropagation();

    if (option.disabled()) return;
    if (!this.selectable()) return;

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
      // In multiple+searchable mode, clear search and refocus input
      if (this.searchable()) {
        this.searchQuery.set('');
        this.focusedIndex.set(-1);
        setTimeout(() => this.searchInputRef?.nativeElement?.focus());
      }
    } else {
      this.value.set(optionValue);
      this.close();
    }
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.multiple()) {
      this.value.set([]);
    } else {
      this.value.set(null);
    }
  }

  selectAsyncOption(option: AsyncSelectOption<T>, event?: MouseEvent): void {
    event?.stopPropagation();

    if (option.disabled) return;
    if (!this.selectable()) return;

    const optionValue = option.value;

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
      // In multiple+searchable mode, clear search and refocus input
      if (this.searchable()) {
        this.searchQuery.set('');
        this.focusedIndex.set(-1);
        this.asyncOptions.set([]);
        setTimeout(() => this.searchInputRef?.nativeElement?.focus());
      }
    } else {
      this.value.set(optionValue);
      this.close();
    }
  }

  isAsyncOptionSelected(option: AsyncSelectOption<T>): boolean {
    const val = this.value();
    if (this.multiple() && Array.isArray(val)) {
      return val.includes(option.value);
    }
    return val === option.value;
  }

  deleteOption(optionValue: T): void {
    // Remove from selection if selected
    if (this.multiple()) {
      const currentValue = (this.value() as T[]) || [];
      if (currentValue.includes(optionValue)) {
        this.value.set(currentValue.filter((v) => v !== optionValue));
      }
    } else if (this.value() === optionValue) {
      this.value.set(null);
    }
    this.deleted.emit(optionValue);
  }

  protected handleTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          this.selectFocusedOption();
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

  protected handleSearchInputKeydown(event: KeyboardEvent): void {
    // Stop propagation so the trigger's keydown handler doesn't
    // interfere (e.g. space would otherwise preventDefault).
    event.stopPropagation();
    switch (event.key) {
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
      case 'Enter':
        event.preventDefault();
        if (this.isOpen()) {
          const focusedIdx = this.focusedIndex();

          if (focusedIdx >= 0) {
            this.selectFocusedOption();
          } else if (this.totalVisibleCount() === 1) {
            // Auto-select single visible option
            if (this.isAsyncMode()) {
              const asyncOpts = this.visibleAsyncOptions();
              if (asyncOpts.length === 1) {
                this.selectAsyncOption(asyncOpts[0]);
              }
            } else {
              const visible = this.visibleOptions();
              if (visible.length === 1) {
                this.selectOption(visible[0]);
              }
            }
          } else if (this.creatable() && this.searchQuery().trim() && !this.exactMatchExists()) {
            this.handleCreate();
          }
        } else {
          this.open();
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

  private selectFocusedOption(): void {
    const focusedIdx = this.focusedIndex();
    if (focusedIdx < 0) return;

    if (this.isAsyncMode()) {
      const asyncOpts = this.visibleAsyncOptions();
      const focused = asyncOpts[focusedIdx];
      if (focused) {
        this.selectAsyncOption(focused);
      }
    } else {
      const focused = this.visibleOptions()[focusedIdx];
      if (focused) {
        this.selectOption(focused);
      }
    }
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);

    if (!this.isOpen()) {
      this.isOpen.set(true);
      this.focusedIndex.set(-1);
      this.opened.emit();
      this.portalDropdown();
    }

    if (this.isAsyncMode()) {
      this.triggerAsyncSearch(value);
    } else {
      // Auto-highlight when exactly one option is visible
      const visible = this.visibleOptions();
      this.focusedIndex.set(visible.length === 1 ? 0 : -1);
    }
  }

  private triggerAsyncSearch(query: string): void {
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Cancel previous request
    if (this.asyncSearchAbortController) {
      this.asyncSearchAbortController.abort();
      this.asyncSearchAbortController = null;
    }

    const trimmedQuery = query.trim();

    // Check minimum search length
    if (trimmedQuery.length < this.minSearchLength()) {
      this.asyncOptions.set([]);
      this.asyncLoading.set(false);
      this.asyncError.set(null);
      this.focusedIndex.set(-1);
      return;
    }

    // Set loading state immediately for visual feedback
    this.asyncLoading.set(true);
    this.asyncError.set(null);

    // Debounce the actual search
    this.debounceTimer = setTimeout(() => {
      this.executeAsyncSearch(trimmedQuery);
    }, this.debounceTime());
  }

  private async executeAsyncSearch(query: string): Promise<void> {
    const searchFn = this.asyncSearch();
    if (!searchFn) return;

    this.asyncSearchAbortController = new AbortController();
    const signal = this.asyncSearchAbortController.signal;

    try {
      const results = await searchFn(query);

      // Check if request was aborted
      if (signal.aborted) return;

      this.asyncOptions.set(results);
      this.asyncLoading.set(false);
      this.asyncError.set(null);

      // Auto-highlight first option if results exist
      this.focusedIndex.set(results.length > 0 ? 0 : -1);
    } catch (error) {
      // Ignore abort errors
      if (signal.aborted) return;

      this.asyncOptions.set([]);
      this.asyncLoading.set(false);
      this.asyncError.set(error instanceof Error ? error.message : 'Search failed');
      this.focusedIndex.set(-1);
    }
  }

  protected handleCreate(): void {
    const query = this.searchQuery().trim();
    if (!query) return;
    this.created.emit(query);
    this.searchQuery.set('');
    this.close();
  }

  private focusNext(): void {
    const current = this.focusedIndex();

    if (this.isAsyncMode()) {
      const opts = this.visibleAsyncOptions();
      let next = current + 1;

      while (next < opts.length && opts[next].disabled) {
        next++;
      }

      if (next < opts.length) {
        this.focusedIndex.set(next);
        this.scrollToFocusedAsync(next);
      }
    } else {
      const opts = this.visibleOptions();
      let next = current + 1;

      while (next < opts.length && opts[next].disabled()) {
        next++;
      }

      if (next < opts.length) {
        this.focusedIndex.set(next);
        this.scrollToFocused();
      }
    }
  }

  private focusPrevious(): void {
    const current = this.focusedIndex();

    if (this.isAsyncMode()) {
      const opts = this.visibleAsyncOptions();
      let prev = current - 1;

      while (prev >= 0 && opts[prev].disabled) {
        prev--;
      }

      if (prev >= 0) {
        this.focusedIndex.set(prev);
        this.scrollToFocusedAsync(prev);
      }
    } else {
      const opts = this.visibleOptions();
      let prev = current - 1;

      while (prev >= 0 && opts[prev].disabled()) {
        prev--;
      }

      if (prev >= 0) {
        this.focusedIndex.set(prev);
        this.scrollToFocused();
      }
    }
  }

  private scrollToFocused(): void {
    const focused = this.visibleOptions()[this.focusedIndex()];
    if (focused) {
      focused.elementRef.nativeElement.scrollIntoView({ block: 'nearest' });
    }
  }

  private scrollToFocusedAsync(index: number): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;

    const optionElements = dropdown.querySelectorAll('.ui-async-option');
    const focusedElement = optionElements[index] as HTMLElement | undefined;
    if (focusedElement) {
      focusedElement.scrollIntoView({ block: 'nearest' });
    }
  }

  private portalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;

    dropdown.style.display = 'block';
    document.body.appendChild(dropdown);
    this.updateDropdownPosition();
    this.addPositionListeners();
  }

  private unportalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;

    if (dropdown.parentElement === document.body) {
      const wrapper = this.elementRef.nativeElement.querySelector('.ui-select-wrapper');
      if (wrapper) {
        wrapper.appendChild(dropdown);
      }
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
      if (this.isOpen()) {
        this.updateDropdownPosition();
      }
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
}
