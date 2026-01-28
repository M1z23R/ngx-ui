import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ToastComponent } from './toast.component';
import type { ToastData, ToastPosition } from './toast.config';

@Component({
  selector: 'ui-toast-container',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  readonly toasts = input<ToastData[]>([]);
  readonly position = input<ToastPosition>('top-right');
  readonly onDismissCallback = input<(id: string) => void>(() => {});

  protected containerClass(): string {
    return `ui-toast-container--${this.position()}`;
  }

  protected onDismiss(id: string): void {
    this.onDismissCallback()(id);
  }
}
