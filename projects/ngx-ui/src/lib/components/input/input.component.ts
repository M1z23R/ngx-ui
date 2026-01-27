import { Component, input, model, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ui-input-wrapper" [class.ui-input-wrapper--error]="error()" [class.ui-input-wrapper--disabled]="disabled()">
      @if (label()) {
        <label class="ui-input__label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span class="ui-input__required">*</span>
          }
        </label>
      }
      <div class="ui-input__container">
        <input
          class="ui-input"
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [(ngModel)]="value"
        />
      </div>
      @if (error()) {
        <span class="ui-input__error">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="ui-input__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ui-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--ui-spacing-xs);
    }

    .ui-input__label {
      font-size: var(--ui-font-sm);
      font-weight: 500;
      color: var(--ui-text);
    }

    .ui-input__required {
      color: var(--ui-danger);
      margin-left: 2px;
    }

    .ui-input__container {
      position: relative;
    }

    .ui-input {
      width: 100%;
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      font-family: inherit;
      font-size: var(--ui-font-md);
      color: var(--ui-text);
      background-color: var(--ui-bg);
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      transition: border-color var(--ui-transition-fast), box-shadow var(--ui-transition-fast);

      &::placeholder {
        color: var(--ui-text-muted);
      }

      &:hover:not(:disabled):not(:read-only) {
        border-color: var(--ui-border-hover);
      }

      &:focus {
        outline: none;
        border-color: var(--ui-border-focus);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
      }

      &:disabled {
        background-color: var(--ui-bg-secondary);
        color: var(--ui-text-disabled);
        cursor: not-allowed;
      }

      &:read-only {
        background-color: var(--ui-bg-secondary);
      }
    }

    .ui-input-wrapper--error .ui-input {
      border-color: var(--ui-danger);

      &:focus {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-danger) 20%, transparent);
      }
    }

    .ui-input__error {
      font-size: var(--ui-font-sm);
      color: var(--ui-danger);
    }

    .ui-input__hint {
      font-size: var(--ui-font-sm);
      color: var(--ui-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly value = model<string | number>('');

  private static nextId = 0;
  private readonly generatedId = `ui-input-${++InputComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);
}
