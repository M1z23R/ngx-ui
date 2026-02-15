import { Injectable, Injector, signal, Type, computed } from '@angular/core';
import { TabRef } from './tab-ref';
import {
  TAB_DATA,
  TAB_REF,
  DynamicTabConfig,
  DynamicTab,
  DEFAULT_TAB_CONFIG,
} from './tab.config';

/**
 * Service for managing dynamic tabs.
 *
 * @example
 * ```typescript
 * @Component({ ... })
 * export class MyTabContent {
 *   private tabRef = inject(TAB_REF) as TabRef<string>;
 *   private data = inject(TAB_DATA) as { message: string };
 *
 *   save() {
 *     this.tabRef.close('saved');
 *   }
 * }
 *
 * // In parent component:
 * const tabRef = this.tabsService.open(MyTabContent, {
 *   label: 'New Tab',
 *   data: { message: 'Hello' },
 *   closable: true
 * });
 *
 * const result = await tabRef.afterClosed();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TabsService {
  private readonly _tabs = signal<DynamicTab[]>([]);
  private readonly _activeTabId = signal<string | null>(null);
  private idCounter = 0;

  /** All currently open tabs */
  readonly tabs = this._tabs.asReadonly();

  /** ID of the currently active tab */
  readonly activeTabId = this._activeTabId.asReadonly();

  /** The currently active tab */
  readonly activeTab = computed(() => {
    const activeId = this._activeTabId();
    return this._tabs().find((t) => t.id === activeId) ?? null;
  });

  /**
   * Opens a new tab with the specified component.
   *
   * @param component - The component to render inside the tab
   * @param config - Configuration options for the tab
   * @returns A TabRef that can be used to close the tab and get results
   */
  open<TComponent, TData = unknown, TResult = unknown>(
    component: Type<TComponent>,
    config: DynamicTabConfig<TData>
  ): TabRef<TResult> {
    const mergedConfig = { ...DEFAULT_TAB_CONFIG, ...config };
    const id = config.id ?? `tab-${++this.idCounter}`;

    const tabRef = new TabRef<TResult>(
      id,
      (ref) => this.close(ref),
      (ref) => this.activate(ref)
    );

    const tab: DynamicTab = {
      id,
      label: config.label,
      icon: config.icon,
      component,
      data: config.data,
      closable: mergedConfig.closable,
      tabRef: tabRef as TabRef<unknown>,
    };

    this._tabs.update((tabs) => [...tabs, tab]);

    if (mergedConfig.activate) {
      this.activateById(id);
    }

    return tabRef;
  }

  /**
   * Closes a tab by its TabRef.
   */
  close<TResult>(tabRef: TabRef<TResult>): void {
    this.closeById(tabRef.id);
  }

  /**
   * Closes a tab by its ID.
   */
  closeById(id: string): void {
    const tabs = this._tabs();
    const index = tabs.findIndex((t) => t.id === id);

    if (index === -1) return;

    // If closing the active tab, activate another one
    if (this._activeTabId() === id) {
      const newActiveTab = tabs[index + 1] ?? tabs[index - 1];
      this._activeTabId.set(newActiveTab?.id ?? null);
      if (newActiveTab) {
        newActiveTab.tabRef._setActive(true);
      }
    }

    // Update the closed tab's active state
    tabs[index].tabRef._setActive(false);

    this._tabs.update((t) => t.filter((tab) => tab.id !== id));
  }

  /**
   * Closes all tabs.
   */
  closeAll(): void {
    this._tabs().forEach((tab) => {
      tab.tabRef._setActive(false);
    });
    this._tabs.set([]);
    this._activeTabId.set(null);
  }

  /**
   * Activates a tab by its TabRef.
   */
  activate<TResult>(tabRef: TabRef<TResult>): void {
    this.activateById(tabRef.id);
  }

  /**
   * Activates a tab by its ID.
   */
  activateById(id: string): void {
    const tabs = this._tabs();
    const tab = tabs.find((t) => t.id === id);

    if (!tab) return;

    // Deactivate current tab
    const currentActive = tabs.find((t) => t.id === this._activeTabId());
    if (currentActive) {
      currentActive.tabRef._setActive(false);
    }

    // Activate new tab
    tab.tabRef._setActive(true);
    this._activeTabId.set(id);
  }

  /**
   * Creates an injector with TAB_DATA and TAB_REF for a tab component.
   * @internal
   */
  _createInjector<TData, TResult>(
    parentInjector: Injector,
    data: TData | undefined,
    tabRef: TabRef<TResult>
  ): Injector {
    return Injector.create({
      providers: [
        { provide: TAB_DATA, useValue: data },
        { provide: TAB_REF, useValue: tabRef },
      ],
      parent: parentInjector,
    });
  }

  /**
   * Gets a tab by its ID.
   */
  getTab(id: string): DynamicTab | undefined {
    return this._tabs().find((t) => t.id === id);
  }

  /**
   * Updates a tab's label.
   */
  updateLabel(id: string, label: string): void {
    this._tabs.update((tabs) =>
      tabs.map((tab) => (tab.id === id ? { ...tab, label } : tab))
    );
  }
}
