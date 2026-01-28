import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type CircularProgressVariant = 'primary' | 'success' | 'warning' | 'danger';
export type CircularProgressSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-circular-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circular-progress.component.html',
  styleUrl: './circular-progress.component.scss',
})
export class CircularProgressComponent {
  readonly value = input(0);
  readonly variant = input<CircularProgressVariant>('primary');
  readonly size = input<CircularProgressSize>('md');
  readonly strokeWidth = input(4);
  readonly showLabel = input(false);
  readonly indeterminate = input(false);

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));

  protected readonly sizeValue = computed(() => {
    const sizes: Record<CircularProgressSize, number> = { sm: 32, md: 48, lg: 64, xl: 96 };
    return sizes[this.size()];
  });

  protected readonly center = computed(() => this.sizeValue() / 2);
  protected readonly radius = computed(() => (this.sizeValue() - this.strokeWidth()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly viewBox = computed(() => `0 0 ${this.sizeValue()} ${this.sizeValue()}`);

  protected readonly dashOffset = computed(() => {
    if (this.indeterminate()) return this.circumference() * 0.75;
    return this.circumference() * (1 - this.clampedValue() / 100);
  });

  protected readonly containerClass = computed(() => {
    const classes = ['ui-circular-progress', `ui-circular-progress--${this.size()}`];
    if (this.indeterminate()) classes.push('ui-circular-progress--indeterminate');
    return classes.join(' ');
  });

  protected readonly circleClass = computed(() => {
    const classes = ['ui-circular-progress__circle', `ui-circular-progress__circle--${this.variant()}`];
    if (this.indeterminate()) classes.push('ui-circular-progress__circle--indeterminate');
    return classes.join(' ');
  });
}
