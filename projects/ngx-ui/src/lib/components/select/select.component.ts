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
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
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
