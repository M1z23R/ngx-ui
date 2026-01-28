import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
} from '@angular/core';

@Component({
  selector: 'ui-option',
  standalone: true,
  template: `
    <div
      class="ui-option"
      [class.ui-option--selected]="selected()"
      [class.ui-option--disabled]="disabled()"
      [class.ui-option--focused]="focused()"
      [attr.role]="'option'"
      [attr.aria-selected]="selected()"
      [attr.aria-disabled]="disabled()"
    >
      @if (multiple() && selected()) {
        <svg class="ui-option__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      }
      <span class="ui-option__content">
        <ng-content />
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ui-option {
      display: flex;
      align-items: center;
      gap: var(--ui-spacing-sm);
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      cursor: pointer;
      transition: background-color var(--ui-transition-fast);
      user-select: none;
    }

    .ui-option:hover:not(.ui-option--disabled) {
      background-color: var(--ui-option-hover-bg, var(--ui-bg-hover));
    }

    .ui-option--focused:not(.ui-option--disabled) {
      background-color: var(--ui-option-hover-bg, var(--ui-bg-hover));
    }

    .ui-option--selected {
      background-color: var(--ui-option-selected-bg, color-mix(in srgb, var(--ui-primary) 10%, transparent));
      color: var(--ui-primary);
    }

    .ui-option--selected:hover:not(.ui-option--disabled) {
      background-color: var(--ui-option-selected-bg, color-mix(in srgb, var(--ui-primary) 15%, transparent));
    }

    .ui-option--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ui-option__check {
      flex-shrink: 0;
      color: var(--ui-primary);
    }

    .ui-option__content {
      flex: 1;
      min-width: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent<T = unknown> {
  readonly value = input<T | null>(null);
  readonly disabled = input(false);

  /** Internal state managed by SelectComponent */
  readonly selected = signal(false);
  readonly focused = signal(false);
  readonly multiple = signal(false);

  readonly elementRef = inject(ElementRef);

  /** Get the text content for display and search */
  getLabel(): string {
    return this.elementRef.nativeElement.textContent?.trim() || '';
  }
}
