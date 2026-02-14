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
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

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
export class ChipInputComponent<T = string> {
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

  /** The array of chip values */
  readonly value = model<T[]>([]);

  /** Emitted when a chip is added */
  readonly added = output<string>();

  /** Emitted when a chip is removed */
  readonly removed = output<T>();

  /** Custom chip template */
  readonly chipTemplate = contentChild(ChipTemplateDirective, { read: TemplateRef });

  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  protected readonly inputValue = signal('');
  protected readonly isFocused = signal(false);

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

  protected onContainerClick(): void {
    if (!this.disabled()) {
      this.inputRef?.nativeElement?.focus();
    }
  }

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

  removeChip(chipValue: T): void {
    this.value.set(this.value().filter((v) => v !== chipValue));
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
    return String(chip);
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
  }
}
