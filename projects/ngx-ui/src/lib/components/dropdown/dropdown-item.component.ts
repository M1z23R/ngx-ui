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
  templateUrl: './dropdown-item.component.html',
  styleUrl: './dropdown-item.component.scss',
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
