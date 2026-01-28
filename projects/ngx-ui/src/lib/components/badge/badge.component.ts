import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly rounded = input<boolean>(false);
  readonly removable = input<boolean>(false);

  readonly removed = output<void>();

  protected readonly badgeClass = computed(() => {
    const classes = ['ui-badge', `ui-badge--${this.variant()}`, `ui-badge--${this.size()}`];
    if (this.rounded()) classes.push('ui-badge--rounded');
    return classes.join(' ');
  });

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
