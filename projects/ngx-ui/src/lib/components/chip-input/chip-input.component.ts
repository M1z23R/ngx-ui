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

export type ChipInputVariant = 'default' | 'outlined' | 'filled';
export type ChipInputSize = 'sm' | 'md' | 'lg';

/** Context provided to custom chip templates */
export interface ChipTemplateContext<T = string> {
  /** The chip value */
  $implicit: T;
  /** Function to remove this chip */
  remove: () => void;
}

/** Directive to mark a custom chip template */
@Directive({
  selector: 'ng-template[uiChipTemplate]',
  standalone: true,
})
export class ChipTemplateDirective {}

@Component({
  selector: 'ui-chip-input',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './chip-input.component.html',
  styleUrl: './chip-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipInputComponent<T = string> implements OnDestroy {
  readonly variant = input<ChipInputVariant>('default');
  readonly size = input<ChipInputSize>('md');
  readonly placeholder = input('Add item...');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly allowDuplicates = input(false);
  /** When false, only emits the `added` event without adding to the array (useful for custom object chips) */
  readonly autoAdd = input(true);

  readonly suggestions = input<(string | AsyncSelectOption<T>)[]>([]);
  readonly asyncSearch = input<AsyncSearchFn<T> | null>(null);
  readonly strict = input(false);
  readonly minSearchLength = input(0);
  readonly debounceTime = input(300);

  /** The array of chip values */
  readonly value = model<T[]>([]);

  /** Emitted when a chip is added */
  readonly added = output<string>();

  /** Emitted when a chip is removed */
  readonly removed = output<T>();

  /** Custom chip template */
  readonly chipTemplate = contentChild(ChipTemplateDirective, { read: TemplateRef });

  readonly optionTemplate = contentChild(OptionTemplateDirective);

  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownRef', { static: true }) dropdownRef!: ElementRef<HTMLElement>;

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

  protected readonly containerClasses = computed(() => {
    const classes = [
      `ui-chip-input--${this.variant()}`,
      `ui-chip-input--${this.size()}`,
    ];
    if (this.isFocused()) classes.push('ui-chip-input--focused');
    if (this.disabled()) classes.push('ui-chip-input--disabled');
    if (this.error()) classes.push('ui-chip-input--error');
    return classes.join(' ');
  });

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

  protected onContainerClick(): void {
    if (!this.disabled()) {
      this.inputRef?.nativeElement?.focus();
    }
  }

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

  protected addChip(chipValue: string): void {
    const current = this.value();
    // For string chips, check duplicates
    if (!this.allowDuplicates() && current.includes(chipValue as T)) {
      return;
    }
    if (this.autoAdd()) {
      this.value.set([...current, chipValue as T]);
    }
    this.inputValue.set('');
    this.added.emit(chipValue);
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

  removeChip(chipValue: T): void {
    this.value.set(this.value().filter((v) => v !== chipValue));
    this.labelCache.delete(chipValue);
    this.removed.emit(chipValue);
    // Refocus input after removal
    setTimeout(() => this.inputRef?.nativeElement?.focus());
  }

  /** Get template context for a chip */
  protected getChipContext(chip: T): ChipTemplateContext<T> {
    return {
      $implicit: chip,
      remove: () => this.removeChip(chip),
    };
  }

  /** Get display text for a chip (for default template) */
  protected getChipDisplay(chip: T): string {
    return this.labelCache.get(chip) ?? String(chip);
  }

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
}
