import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
})
export class ProgressComponent {
  readonly value = input(0);
  readonly variant = input<ProgressVariant>('primary');
  readonly size = input<ProgressSize>('md');
  readonly showLabel = input(false);
  readonly indeterminate = input(false);
  readonly striped = input(false);
  readonly animated = input(false);

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));

  protected readonly barWidth = computed(() => {
    if (this.indeterminate()) return '30%';
    return `${this.clampedValue()}%`;
  });

  protected readonly trackClass = computed(() => {
    return `ui-progress ui-progress--${this.size()}`;
  });

  protected readonly barClass = computed(() => {
    const classes = ['ui-progress__bar', `ui-progress__bar--${this.variant()}`];
    if (this.striped() || this.animated()) classes.push('ui-progress__bar--striped');
    if (this.animated()) classes.push('ui-progress__bar--animated');
    if (this.indeterminate()) classes.push('ui-progress__bar--indeterminate');
    return classes.join(' ');
  });
}
