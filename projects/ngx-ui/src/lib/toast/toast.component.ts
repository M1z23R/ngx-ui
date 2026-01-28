import {
  Component,
  input,
  output,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import type { ToastData } from './toast.config';

@Component({
  selector: 'ui-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  readonly data = input.required<ToastData>();

  readonly dismissed = output<string>();

  protected readonly isExiting = signal(false);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  protected readonly toastClasses = computed(() => {
    return `ui-toast--${this.data().variant}`;
  });

  ngOnInit(): void {
    const duration = this.data().duration;
    if (duration > 0) {
      this.timeoutId = setTimeout(() => this.dismiss(), duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  dismiss(): void {
    if (this.isExiting()) return;
    this.isExiting.set(true);
    // Wait for exit animation (300ms)
    setTimeout(() => {
      this.dismissed.emit(this.data().id);
    }, 300);
  }
}
