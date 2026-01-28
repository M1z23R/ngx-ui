import {
  Component,
  input,
  model,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';

export type SwitchSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-switch',
  standalone: true,
  template: `
    <label
      class="ui-switch"
      [class]="switchClasses()"
      [class.ui-switch--disabled]="disabled()"
      [class.ui-switch--checked]="checked()"
    >
      <input
        type="checkbox"
        class="ui-switch__input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="handleChange($event)"
        role="switch"
        [attr.aria-checked]="checked()"
      />
      <span class="ui-switch__track">
        <span class="ui-switch__thumb"></span>
      </span>
      @if (hasLabel()) {
        <span class="ui-switch__label">
          <ng-content />
        </span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .ui-switch {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-spacing-sm);
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .ui-switch--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .ui-switch__input {
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

    .ui-switch__track {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      background-color: var(--ui-bg-tertiary);
      border-radius: 9999px;
      transition: background-color var(--ui-transition-fast);
    }

    .ui-switch__thumb {
      position: absolute;
      background-color: white;
      border-radius: 50%;
      box-shadow: var(--ui-shadow-sm);
      transition: transform var(--ui-transition-fast);
    }

    /* Sizes */
    .ui-switch--sm .ui-switch__track {
      width: 28px;
      height: 16px;
    }

    .ui-switch--sm .ui-switch__thumb {
      width: 12px;
      height: 12px;
      left: 2px;
    }

    .ui-switch--sm.ui-switch--checked .ui-switch__thumb {
      transform: translateX(12px);
    }

    .ui-switch--md .ui-switch__track {
      width: 36px;
      height: 20px;
    }

    .ui-switch--md .ui-switch__thumb {
      width: 16px;
      height: 16px;
      left: 2px;
    }

    .ui-switch--md.ui-switch--checked .ui-switch__thumb {
      transform: translateX(16px);
    }

    .ui-switch--lg .ui-switch__track {
      width: 44px;
      height: 24px;
    }

    .ui-switch--lg .ui-switch__thumb {
      width: 20px;
      height: 20px;
      left: 2px;
    }

    .ui-switch--lg.ui-switch--checked .ui-switch__thumb {
      transform: translateX(20px);
    }

    .ui-switch--sm .ui-switch__label {
      font-size: var(--ui-font-sm);
    }

    .ui-switch--md .ui-switch__label {
      font-size: var(--ui-font-md);
    }

    .ui-switch--lg .ui-switch__label {
      font-size: var(--ui-font-lg);
    }

    /* States */
    .ui-switch:hover:not(.ui-switch--disabled) .ui-switch__track {
      background-color: var(--ui-secondary);
    }

    .ui-switch__input:focus-visible + .ui-switch__track {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
    }

    .ui-switch--checked .ui-switch__track {
      background-color: var(--ui-primary);
    }

    .ui-switch--checked:hover:not(.ui-switch--disabled) .ui-switch__track {
      background-color: var(--ui-primary-hover);
    }

    .ui-switch__label {
      color: var(--ui-text);
    }

    .ui-switch--disabled .ui-switch__label {
      color: var(--ui-text-disabled);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  readonly size = input<SwitchSize>('md');
  readonly disabled = input(false);

  readonly checked = model(false);

  readonly changed = output<boolean>();

  // Check if there's label content
  protected readonly hasLabel = input(true);

  protected readonly switchClasses = computed(() => {
    return `ui-switch--${this.size()}`;
  });

  protected handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.changed.emit(target.checked);
  }
}
