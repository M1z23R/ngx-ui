import { InjectionToken } from '@angular/core';

/**
 * Interface for components that support loading state.
 * Components implementing this can be controlled by LoadingDirective.
 */
export interface Loadable {
  /**
   * Sets the loading state of the component.
   * @param loading - Whether the component should be in loading state
   */
  setLoading(loading: boolean): void;
}

/**
 * Injection token for components that implement Loadable.
 * Components should provide themselves using this token to work with LoadingDirective.
 *
 * @example
 * ```typescript
 * @Component({
 *   providers: [{ provide: LOADABLE, useExisting: MyComponent }]
 * })
 * export class MyComponent implements Loadable {
 *   setLoading(loading: boolean): void { ... }
 * }
 * ```
 */
export const LOADABLE = new InjectionToken<Loadable>('LOADABLE');
