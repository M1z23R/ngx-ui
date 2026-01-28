import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ui-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly title = input<string>('');
  readonly dismissible = input(false);
  readonly showIcon = input(true);

  readonly dismissed = output<void>();

  protected readonly visible = signal(true);

  protected readonly alertClass = computed(() => {
    return `ui-alert ui-alert--${this.variant()}`;
  });

  protected dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
