import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { ToastContainerComponent } from './toast-container.component';
import { ToastRef } from './toast-ref';
import {
  ToastConfig,
  ToastData,
  ToastPosition,
  ToastVariant,
  DEFAULT_TOAST_CONFIG,
} from './toast.config';

/**
 * Service for showing toast notifications.
 *
 * @example
 * ```typescript
 * // Simple usage
 * this.toastService.success('File saved successfully');
 * this.toastService.error('Failed to save file', 'Error');
 *
 * // With custom duration (3 seconds)
 * this.toastService.warning('Session expiring soon', 'Warning', 3000);
 *
 * // Persistent toast (no auto-dismiss)
 * this.toastService.info('Processing...', undefined, 0);
 *
 * // With full config
 * const toastRef = this.toastService.show({
 *   message: 'Custom toast',
 *   variant: 'info',
 *   duration: 3000,
 *   position: 'bottom-right'
 * });
 *
 * // Dismiss programmatically
 * toastRef.dismiss();
 *
 * // Dismiss all
 * this.toastService.dismissAll();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  private containerRef: ComponentRef<ToastContainerComponent> | null = null;
  private readonly toasts = signal<ToastData[]>([]);
  private readonly toastRefs = new Map<string, ToastRef>();
  private idCounter = 0;
  private currentPosition: ToastPosition = DEFAULT_TOAST_CONFIG.position;

  /**
   * Show a toast with custom configuration.
   */
  show(config: ToastConfig): ToastRef {
    const id = `toast-${++this.idCounter}`;
    const position = config.position ?? DEFAULT_TOAST_CONFIG.position;
    const maxVisible = config.maxVisible ?? DEFAULT_TOAST_CONFIG.maxVisible;

    // If position changed, dismiss all existing toasts
    if (this.toasts().length > 0 && position !== this.currentPosition) {
      this.dismissAll();
    }
    this.currentPosition = position;

    // Enforce max visible limit - dismiss oldest toasts to make room
    if (maxVisible > 0) {
      const currentToasts = this.toasts();
      const toRemoveCount = currentToasts.length - maxVisible + 1;
      if (toRemoveCount > 0) {
        const toastsToRemove = currentToasts.slice(0, toRemoveCount);
        for (const toast of toastsToRemove) {
          this.dismiss(toast.id);
        }
      }
    }

    const toastData: ToastData = {
      id,
      message: config.message,
      title: config.title,
      variant: config.variant ?? DEFAULT_TOAST_CONFIG.variant,
      duration: config.duration ?? DEFAULT_TOAST_CONFIG.duration,
      position,
      dismissible: config.dismissible ?? DEFAULT_TOAST_CONFIG.dismissible,
      showProgress: config.showProgress ?? DEFAULT_TOAST_CONFIG.showProgress,
    };

    const toastRef = new ToastRef(id, (toastId) => this.dismiss(toastId));
    this.toastRefs.set(id, toastRef);

    this.toasts.update(list => [...list, toastData]);
    this.ensureContainer();

    return toastRef;
  }

  /**
   * Show a success toast.
   * @param message Toast message
   * @param title Optional title
   * @param duration Optional duration in ms (0 = no auto-dismiss)
   */
  success(message: string, title?: string, duration?: number): ToastRef {
    return this.show({ message, title, variant: 'success', duration });
  }

  /**
   * Show an error toast.
   * @param message Toast message
   * @param title Optional title
   * @param duration Optional duration in ms (0 = no auto-dismiss)
   */
  error(message: string, title?: string, duration?: number): ToastRef {
    return this.show({ message, title, variant: 'error', duration });
  }

  /**
   * Show a warning toast.
   * @param message Toast message
   * @param title Optional title
   * @param duration Optional duration in ms (0 = no auto-dismiss)
   */
  warning(message: string, title?: string, duration?: number): ToastRef {
    return this.show({ message, title, variant: 'warning', duration });
  }

  /**
   * Show an info toast.
   * @param message Toast message
   * @param title Optional title
   * @param duration Optional duration in ms (0 = no auto-dismiss)
   */
  info(message: string, title?: string, duration?: number): ToastRef {
    return this.show({ message, title, variant: 'info', duration });
  }

  /**
   * Dismiss a specific toast by ID.
   */
  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
    this.toastRefs.delete(id);

    if (this.toasts().length === 0) {
      this.destroyContainer();
    }
  }

  /**
   * Dismiss all toasts.
   */
  dismissAll(): void {
    this.toasts.set([]);
    this.toastRefs.clear();
    this.destroyContainer();
  }

  private ensureContainer(): void {
    if (this.containerRef) {
      this.updateContainer();
      return;
    }

    this.containerRef = createComponent(ToastContainerComponent, {
      environmentInjector: this.injector,
    });

    this.updateContainer();
    this.appRef.attachView(this.containerRef.hostView);
    document.body.appendChild(this.containerRef.location.nativeElement);
  }

  private updateContainer(): void {
    if (!this.containerRef) return;

    this.containerRef.setInput('toasts', this.toasts());
    this.containerRef.setInput('position', this.currentPosition);
    this.containerRef.setInput('onDismissCallback', (id: string) => this.dismiss(id));
    this.containerRef.changeDetectorRef.detectChanges();
  }

  private destroyContainer(): void {
    if (!this.containerRef) return;

    this.appRef.detachView(this.containerRef.hostView);
    this.containerRef.destroy();
    this.containerRef = null;
  }
}
