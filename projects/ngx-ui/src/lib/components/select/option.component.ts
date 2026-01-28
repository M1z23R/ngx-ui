import {
  Component,
  input,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
} from '@angular/core';

@Component({
  selector: 'ui-option',
  standalone: true,
  templateUrl: './option.component.html',
  styleUrl: './option.component.scss',
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
