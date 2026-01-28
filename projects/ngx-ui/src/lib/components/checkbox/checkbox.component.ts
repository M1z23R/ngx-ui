import { Component, input, model, output, computed, ChangeDetectionStrategy } from '@angular/core';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly size = input<CheckboxSize>('md');
  readonly disabled = input(false);
  readonly indeterminate = input(false);

  readonly checked = model(false);

  // Check if there's label content
  protected readonly hasLabel = input(true);

  protected readonly checkboxClasses = computed(() => {
    return `ui-checkbox--${this.size()}`;
  });

  protected handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
