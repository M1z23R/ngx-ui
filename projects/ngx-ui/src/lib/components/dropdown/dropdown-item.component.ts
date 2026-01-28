import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
} from '@angular/core';

@Component({
  selector: 'ui-dropdown-item',
  standalone: true,
  template: `
    <div
      class="ui-dropdown-item"
      [class.ui-dropdown-item--disabled]="disabled()"
      [class.ui-dropdown-item--focused]="focused()"
      [attr.role]="'menuitem'"
      [attr.aria-disabled]="disabled()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (click)="handleClick($event)"
      (keydown)="handleKeydown($event)"
    >
      @if (icon()) {
        <span class="ui-dropdown-item__icon">
          <ng-content select="[slot=icon]" />
        </span>
      }
      <span class="ui-dropdown-item__content">
        <ng-content />
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ui-dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--ui-spacing-sm);
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      cursor: pointer;
      transition: background-color var(--ui-transition-fast);
      user-select: none;
      outline: none;
    }

    .ui-dropdown-item:hover:not(.ui-dropdown-item--disabled) {
      background-color: var(--ui-option-hover-bg, var(--ui-bg-hover));
    }

    .ui-dropdown-item--focused:not(.ui-dropdown-item--disabled) {
      background-color: var(--ui-option-hover-bg, var(--ui-bg-hover));
    }

    .ui-dropdown-item--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ui-dropdown-item__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--ui-text-muted);
    }

    .ui-dropdown-item__content {
      flex: 1;
      min-width: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownItemComponent {
  readonly disabled = input(false);
  readonly icon = input<string>('');

  readonly clicked = output<void>();

  /** Internal state managed by DropdownComponent */
  readonly focused = signal(false);

  readonly elementRef = inject(ElementRef);

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.disabled()) {
        this.clicked.emit();
      }
    }
  }
}
