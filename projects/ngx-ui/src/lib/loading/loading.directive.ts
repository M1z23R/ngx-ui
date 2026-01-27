import { Directive, effect, inject, input } from '@angular/core';
import { LOADABLE } from './loadable';
import { LoadingService } from './loading.service';

/**
 * Directive that connects a component's loading state to the LoadingService.
 *
 * The host component must:
 * 1. Implement the Loadable interface
 * 2. Provide itself using the LOADABLE token
 *
 * @example
 * ```html
 * <ui-button uiLoading="login">Login</ui-button>
 * <ui-button uiLoading="submit">Submit</ui-button>
 * ```
 *
 * @example
 * ```typescript
 * // In your component/service
 * loadingService.start('login');  // Button with uiLoading="login" shows loading
 * loadingService.stop('login');   // Loading stops
 * ```
 */
@Directive({
  selector: '[uiLoading]',
  standalone: true,
})
export class LoadingDirective {
  private readonly loadingService = inject(LoadingService);
  private readonly loadable = inject(LOADABLE, { optional: true });

  /**
   * The loading identifier to watch.
   * When this identifier's loading state changes in LoadingService,
   * the host component's loading state will be updated.
   */
  readonly uiLoading = input.required<string>();

  constructor() {
    effect(() => {
      const id = this.uiLoading();
      const isLoading = this.loadingService.isLoading(id)();

      if (this.loadable) {
        this.loadable.setLoading(isLoading);
      } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `[LoadingDirective] No LOADABLE provider found. ` +
            `Make sure the host component implements Loadable and provides itself with the LOADABLE token.`
        );
      }
    });
  }
}
