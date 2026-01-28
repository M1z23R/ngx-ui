import {
  Component,
  input,
  model,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  template: `
    <label
      class="ui-checkbox"
      [class]="checkboxClasses()"
      [class.ui-checkbox--disabled]="disabled()"
      [class.ui-checkbox--checked]="checked()"
      [class.ui-checkbox--indeterminate]="indeterminate()"
    >
      <input
        type="checkbox"
        class="ui-checkbox__input"
        [checked]="checked()"
        [disabled]="disabled()"
        [indeterminate]="indeterminate()"
        (change)="handleChange($event)"
      />
      <span class="ui-checkbox__box">
        @if (checked() && !indeterminate()) {
          <svg class="ui-checkbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        }
        @if (indeterminate()) {
          <svg class="ui-checkbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        }
      </span>
      @if (hasLabel()) {
        <span class="ui-checkbox__label">
          <ng-content />
        </span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .ui-checkbox {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-spacing-sm);
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .ui-checkbox--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .ui-checkbox__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
      opacity: 0;
      pointer-events: none;
    }

    .ui-checkbox__box {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background-color: var(--ui-bg);
      border: 2px solid var(--ui-border);
      border-radius: var(--ui-radius-sm);
      transition: all var(--ui-transition-fast);
    }

    /* Sizes */
    .ui-checkbox--sm .ui-checkbox__box {
      width: 14px;
      height: 14px;
    }

    .ui-checkbox--md .ui-checkbox__box {
      width: 18px;
      height: 18px;
    }

    .ui-checkbox--lg .ui-checkbox__box {
      width: 22px;
      height: 22px;
    }

    .ui-checkbox--sm .ui-checkbox__label {
      font-size: var(--ui-font-sm);
    }

    .ui-checkbox--md .ui-checkbox__label {
      font-size: var(--ui-font-md);
    }

    .ui-checkbox--lg .ui-checkbox__label {
      font-size: var(--ui-font-lg);
    }

    /* States */
    .ui-checkbox:hover:not(.ui-checkbox--disabled) .ui-checkbox__box {
      border-color: var(--ui-border-hover);
    }

    .ui-checkbox__input:focus-visible + .ui-checkbox__box {
      border-color: var(--ui-border-focus);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
    }

    .ui-checkbox--checked .ui-checkbox__box,
    .ui-checkbox--indeterminate .ui-checkbox__box {
      background-color: var(--ui-primary);
      border-color: var(--ui-primary);
    }

    .ui-checkbox--checked:hover:not(.ui-checkbox--disabled) .ui-checkbox__box,
    .ui-checkbox--indeterminate:hover:not(.ui-checkbox--disabled) .ui-checkbox__box {
      background-color: var(--ui-primary-hover);
      border-color: var(--ui-primary-hover);
    }

    .ui-checkbox__icon {
      width: 100%;
      height: 100%;
      color: var(--ui-primary-text);
      padding: 1px;
    }

    .ui-checkbox__label {
      color: var(--ui-text);
    }

    .ui-checkbox--disabled .ui-checkbox__label {
      color: var(--ui-text-disabled);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly size = input<CheckboxSize>('md');
  readonly disabled = input(false);
  readonly indeterminate = input(false);

  readonly checked = model(false);

  readonly changed = output<boolean>();

  // Check if there's label content
  protected readonly hasLabel = input(true);

  protected readonly checkboxClasses = computed(() => {
    return `ui-checkbox--${this.size()}`;
  });

  protected handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.changed.emit(target.checked);
  }
}
