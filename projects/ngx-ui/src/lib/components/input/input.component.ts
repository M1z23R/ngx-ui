import { Component, input, model, computed, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ValidationError, ValidatorFn } from '../../validators/validators';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

/**
 * Validation state exposed by the input component
 */
export interface ValidationState {
  /** Whether the input has been focused and then blurred */
  touched: boolean;
  /** Whether the input value has been changed */
  dirty: boolean;
  /** Whether all validators pass */
  valid: boolean;
  /** Whether any validator fails */
  invalid: boolean;
  /** List of current validation errors */
  errors: ValidationError[];
  /** First error message, if any */
  errorMessage: string | null;
  /** CSS classes for validation state */
  classes: {
    touched: boolean;
    untouched: boolean;
    dirty: boolean;
    pristine: boolean;
    valid: boolean;
    invalid: boolean;
  };
}

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ui-input--touched]': 'touched()',
    '[class.ui-input--untouched]': '!touched()',
    '[class.ui-input--dirty]': 'dirty()',
    '[class.ui-input--pristine]': '!dirty()',
    '[class.ui-input--valid]': 'isValid()',
    '[class.ui-input--invalid]': 'isInvalid()',
  },
})
export class InputComponent {
  readonly type = input<InputType>('text');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly id = input<string>('');

  /** Array of validator functions to run against the value */
  readonly validators = input<ValidatorFn[]>([]);

  /** Single custom validator function */
  readonly validatorFn = input<ValidatorFn | null>(null);

  /** When to show validation errors: 'touched' (default), 'dirty', or 'always' */
  readonly showErrorsOn = input<'touched' | 'dirty' | 'always'>('touched');

  readonly value = model<string | number>('');

  private static nextId = 0;
  private readonly generatedId = `ui-input-${++InputComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);

  /** Whether the input has been blurred at least once */
  readonly touched = signal(false);

  /** Whether the input value has been modified */
  readonly dirty = signal(false);

  private readonly initialValue = signal<string | number>('');
  private initialized = false;

  constructor() {
    effect(() => {
      const val = this.value();
      if (!this.initialized) {
        this.initialValue.set(val);
        this.initialized = true;
      }
    });
  }

  /** All validation errors from validators and validatorFn */
  readonly errors = computed<ValidationError[]>(() => {
    const value = this.value();
    const errors: ValidationError[] = [];

    // Run array validators
    for (const validator of this.validators()) {
      const error = validator(value);
      if (error) errors.push(error);
    }

    // Run single validatorFn
    const customValidator = this.validatorFn();
    if (customValidator) {
      const error = customValidator(value);
      if (error) errors.push(error);
    }

    return errors;
  });

  /** Whether the input passes all validations */
  readonly isValid = computed(() => this.errors().length === 0);

  /** Whether the input has validation errors */
  readonly isInvalid = computed(() => this.errors().length > 0);

  /** First error message from validators */
  readonly errorMessage = computed(() => this.errors()[0]?.message ?? null);

  /** Whether to display the error based on showErrorsOn setting */
  readonly shouldShowError = computed(() => {
    if (!this.isInvalid()) return false;

    switch (this.showErrorsOn()) {
      case 'always':
        return true;
      case 'dirty':
        return this.dirty();
      case 'touched':
      default:
        return this.touched();
    }
  });

  /** Combined error - either from error input or from validation */
  protected readonly displayError = computed(() => {
    const manualError = this.error();
    if (manualError) return manualError;
    return this.shouldShowError() ? this.errorMessage() : null;
  });

  /** Full validation state object for external consumption */
  readonly validationState = computed<ValidationState>(() => ({
    touched: this.touched(),
    dirty: this.dirty(),
    valid: this.isValid(),
    invalid: this.isInvalid(),
    errors: this.errors(),
    errorMessage: this.errorMessage(),
    classes: {
      touched: this.touched(),
      untouched: !this.touched(),
      dirty: this.dirty(),
      pristine: !this.dirty(),
      valid: this.isValid(),
      invalid: this.isInvalid(),
    },
  }));

  /** Marks the input as touched (called on blur) */
  protected onBlur(): void {
    this.touched.set(true);
  }

  /** Marks the input as dirty when value changes */
  protected onInput(): void {
    if (!this.dirty()) {
      this.dirty.set(true);
    }
  }

  /** Reset validation state */
  reset(): void {
    this.touched.set(false);
    this.dirty.set(false);
    this.value.set(this.initialValue());
  }

  /** Mark as touched programmatically */
  markAsTouched(): void {
    this.touched.set(true);
  }

  /** Mark as dirty programmatically */
  markAsDirty(): void {
    this.dirty.set(true);
  }

  /** Check if a specific error exists by key */
  hasError(key: string): boolean {
    return this.errors().some((e) => e.key === key);
  }

  /** Get error by key */
  getError(key: string): ValidationError | undefined {
    return this.errors().find((e) => e.key === key);
  }
}
