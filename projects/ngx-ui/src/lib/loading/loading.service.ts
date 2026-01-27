import { Injectable, signal, computed, Signal } from '@angular/core';

/**
 * Service for managing loading states by identifier.
 *
 * @example
 * ```typescript
 * // In a component or service
 * private loadingService = inject(LoadingService);
 *
 * async login() {
 *   this.loadingService.start('login');
 *   try {
 *     await this.authService.login();
 *   } finally {
 *     this.loadingService.stop('login');
 *   }
 * }
 * ```
 *
 * @example
 * ```html
 * <!-- In template -->
 * <ui-button uiLoading="login">Login</ui-button>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly loadingStates = signal<Map<string, boolean>>(new Map());

  /**
   * Starts loading for the given identifier.
   * @param id - Unique identifier for the loading state
   */
  start(id: string): void {
    this.loadingStates.update((states) => {
      const newStates = new Map(states);
      newStates.set(id, true);
      return newStates;
    });
  }

  /**
   * Stops loading for the given identifier.
   * @param id - Unique identifier for the loading state
   */
  stop(id: string): void {
    this.loadingStates.update((states) => {
      const newStates = new Map(states);
      newStates.set(id, false);
      return newStates;
    });
  }

  /**
   * Sets the loading state for the given identifier.
   * @param id - Unique identifier for the loading state
   * @param loading - Whether loading is active
   */
  set(id: string, loading: boolean): void {
    if (loading) {
      this.start(id);
    } else {
      this.stop(id);
    }
  }

  /**
   * Toggles the loading state for the given identifier.
   * @param id - Unique identifier for the loading state
   */
  toggle(id: string): void {
    const current = this.isLoading(id)();
    this.set(id, !current);
  }

  /**
   * Returns a signal that indicates whether the given identifier is loading.
   * @param id - Unique identifier for the loading state
   * @returns Signal<boolean> that updates when the loading state changes
   */
  isLoading(id: string): Signal<boolean> {
    return computed(() => this.loadingStates().get(id) ?? false);
  }

  /**
   * Returns whether any loading state is active.
   * @returns Signal<boolean> that is true if any identifier is loading
   */
  isAnyLoading(): Signal<boolean> {
    return computed(() => {
      const states = this.loadingStates();
      for (const value of states.values()) {
        if (value) return true;
      }
      return false;
    });
  }

  /**
   * Clears the loading state for the given identifier.
   * @param id - Unique identifier to clear
   */
  clear(id: string): void {
    this.loadingStates.update((states) => {
      const newStates = new Map(states);
      newStates.delete(id);
      return newStates;
    });
  }

  /**
   * Clears all loading states.
   */
  clearAll(): void {
    this.loadingStates.set(new Map());
  }
}
