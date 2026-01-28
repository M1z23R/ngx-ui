import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly variant = input<SpinnerVariant>('primary');

  protected readonly spinnerClass = computed(() => {
    return `ui-spinner ui-spinner--${this.size()} ui-spinner--${this.variant()}`;
  });
}
