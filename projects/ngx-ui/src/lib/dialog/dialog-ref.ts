/**
 * Reference to an opened dialog.
 * Provides methods to close the dialog and access its result.
 */
export class DialogRef<TResult = unknown> {
  private resolvePromise!: (value: TResult | undefined) => void;
  private readonly resultPromise: Promise<TResult | undefined>;

  constructor(private readonly closeFn: () => void) {
    this.resultPromise = new Promise<TResult | undefined>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  /**
   * Closes the dialog with an optional result value.
   */
  close(result?: TResult): void {
    this.resolvePromise(result);
    this.closeFn();
  }

  /**
   * Returns a promise that resolves when the dialog is closed.
   * The promise resolves with the result passed to close(), or undefined if closed without a result.
   */
  afterClosed(): Promise<TResult | undefined> {
    return this.resultPromise;
  }
}
