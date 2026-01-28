import { Component, input, model, computed, ChangeDetectionStrategy } from '@angular/core';

export type SwitchSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-switch',
  standalone: true,
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  readonly size = input<SwitchSize>('md');
  readonly disabled = input(false);

  readonly checked = model(false);

  // Check if there's label content
  protected readonly hasLabel = input(true);

  protected readonly switchClasses = computed(() => {
    return `ui-switch--${this.size()}`;
  });

  protected handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
