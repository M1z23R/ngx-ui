import { signal, Signal } from '@angular/core';

/**
 * Reference to a dynamically created tab.
 * Provides methods to close the tab and access its result.
 */
export class TabRef<TResult = unknown> {
  private resolvePromise!: (value: TResult | undefined) => void;
  private readonly resultPromise: Promise<TResult | undefined>;
  private readonly _isActive = signal(false);

  /** Unique identifier for this tab */
  readonly id: string;

  /** Whether this tab is currently active */
  readonly isActive: Signal<boolean> = this._isActive.asReadonly();

  constructor(
    id: string,
    private readonly closeFn: (tabRef: TabRef<TResult>) => void,
    private readonly activateFn: (tabRef: TabRef<TResult>) => void
  ) {
    this.id = id;
    this.resultPromise = new Promise<TResult | undefined>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  /**
   * Closes the tab with an optional result value.
   */
  close(result?: TResult): void {
    this.resolvePromise(result);
    this.closeFn(this);
  }

  /**
   * Activates this tab.
   */
  activate(): void {
    this.activateFn(this);
  }

  /**
   * Returns a promise that resolves when the tab is closed.
   * The promise resolves with the result passed to close(), or undefined if closed without a result.
   */
  afterClosed(): Promise<TResult | undefined> {
    return this.resultPromise;
  }

  /** @internal */
  _setActive(active: boolean): void {
    this._isActive.set(active);
  }
}
