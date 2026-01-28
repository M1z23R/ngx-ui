/**
 * Reference to an active toast notification.
 * Used to programmatically dismiss a toast.
 */
export class ToastRef {
  private _dismissed = false;
  private _dismissFn: (() => void) | null = null;

  constructor(
    public readonly id: string,
    private readonly onDismiss: (id: string) => void
  ) {}

  /** Whether the toast has been dismissed */
  get dismissed(): boolean {
    return this._dismissed;
  }

  /** Dismiss this toast */
  dismiss(): void {
    if (this._dismissed) return;
    this._dismissed = true;
    this.onDismiss(this.id);
    this._dismissFn?.();
  }

  /** @internal */
  _setDismissFn(fn: () => void): void {
    this._dismissFn = fn;
  }
}
