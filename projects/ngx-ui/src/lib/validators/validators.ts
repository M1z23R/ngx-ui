/**
 * Validation error returned by validators
 */
export interface ValidationError {
  /** Unique key identifying the error type (e.g., 'required', 'email', 'minLength') */
  key: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Validator function type
 * Returns a ValidationError if validation fails, null if valid
 */
export type ValidatorFn = (value: unknown) => ValidationError | null;

/**
 * Collection of built-in validators for form inputs
 *
 * @example
 * // Using predefined validators
 * <ui-input [validators]="[Validators.required, Validators.email]" />
 *
 * @example
 * // Using validators with parameters
 * <ui-input [validators]="[Validators.required, Validators.minLength(3), Validators.maxLength(50)]" />
 *
 * @example
 * // Custom validator function
 * const noSpaces: ValidatorFn = (value) =>
 *   typeof value === 'string' && value.includes(' ')
 *     ? { key: 'noSpaces', message: 'Spaces are not allowed' }
 *     : null;
 * <ui-input [validatorFn]="noSpaces" />
 */
export class Validators {
  /**
   * Validates that the value is not empty
   */
  static required: ValidatorFn = (value: unknown): ValidationError | null => {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    return isEmpty ? { key: 'required', message: 'This field is required' } : null;
  };

  /**
   * Validates email format
   */
  static email: ValidatorFn = (value: unknown): ValidationError | null => {
    if (!value || typeof value !== 'string') return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) ? null : { key: 'email', message: 'Please enter a valid email address' };
  };

  /**
   * Validates minimum string length
   */
  static minLength(min: number): ValidatorFn {
    return (value: unknown): ValidationError | null => {
      if (!value || typeof value !== 'string') return null;
      return value.length >= min
        ? null
        : { key: 'minLength', message: `Minimum ${min} characters required` };
    };
  }

  /**
   * Validates maximum string length
   */
  static maxLength(max: number): ValidatorFn {
    return (value: unknown): ValidationError | null => {
      if (!value || typeof value !== 'string') return null;
      return value.length <= max
        ? null
        : { key: 'maxLength', message: `Maximum ${max} characters allowed` };
    };
  }

  /**
   * Validates minimum numeric value
   */
  static min(min: number): ValidatorFn {
    return (value: unknown): ValidationError | null => {
      if (value === '' || value === null || value === undefined) return null;
      const numValue = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : NaN;
      if (isNaN(numValue)) return null;
      return numValue >= min
        ? null
        : { key: 'min', message: `Value must be at least ${min}` };
    };
  }

  /**
   * Validates maximum numeric value
   */
  static max(max: number): ValidatorFn {
    return (value: unknown): ValidationError | null => {
      if (value === '' || value === null || value === undefined) return null;
      const numValue = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : NaN;
      if (isNaN(numValue)) return null;
      return numValue <= max
        ? null
        : { key: 'max', message: `Value must be at most ${max}` };
    };
  }

  /**
   * Validates against a regex pattern
   */
  static pattern(pattern: RegExp, message?: string): ValidatorFn {
    return (value: unknown): ValidationError | null => {
      if (!value || typeof value !== 'string') return null;
      return pattern.test(value)
        ? null
        : { key: 'pattern', message: message ?? 'Invalid format' };
    };
  }

  /**
   * Validates URL format
   */
  static url: ValidatorFn = (value: unknown): ValidationError | null => {
    if (!value || typeof value !== 'string') return null;
    // Stricter URL regex: requires protocol, valid domain with TLD, no spaces
    const urlRegex = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+([/?#].*)?$/;
    return urlRegex.test(value) ? null : { key: 'url', message: 'Please enter a valid URL' };
  };

  /**
   * Validates that value contains only numeric characters
   */
  static numeric: ValidatorFn = (value: unknown): ValidationError | null => {
    if (!value || typeof value !== 'string') return null;
    return /^\d+$/.test(value) ? null : { key: 'numeric', message: 'Only numbers are allowed' };
  };

  /**
   * Validates that value contains only alphanumeric characters
   */
  static alphanumeric: ValidatorFn = (value: unknown): ValidationError | null => {
    if (!value || typeof value !== 'string') return null;
    return /^[a-zA-Z0-9]+$/.test(value)
      ? null
      : { key: 'alphanumeric', message: 'Only letters and numbers are allowed' };
  };
}
