import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { TabRef } from './tab-ref';

/**
 * Injection token for tab data passed to the component.
 */
export const TAB_DATA = new InjectionToken<unknown>('TAB_DATA');

/**
 * Injection token for the tab reference.
 */
export const TAB_REF = new InjectionToken<TabRef>('TAB_REF');

/**
 * Configuration for a dynamic tab.
 */
export interface DynamicTabConfig<TData = unknown> {
  /** Label displayed in the tab header */
  label: string;
  /** Optional icon template */
  icon?: TemplateRef<unknown>;
  /** Data to pass to the tab component via TAB_DATA injection token */
  data?: TData;
  /** Whether the tab can be closed (default: true) */
  closable?: boolean;
  /** Whether to activate the tab immediately after creation (default: true) */
  activate?: boolean;
  /** Optional unique ID for the tab */
  id?: string;
}

/**
 * Internal representation of a dynamic tab.
 * @internal
 */
export interface DynamicTab<TData = unknown, TResult = unknown> {
  id: string;
  label: string;
  icon?: TemplateRef<unknown>;
  component: Type<unknown>;
  data?: TData;
  closable: boolean;
  tabRef: TabRef<TResult>;
}

/**
 * Controls how inactive tab panels are handled.
 * - `'conditional'` (default): Inactive panels are removed from the DOM (destroyed/recreated on switch).
 * - `'persistent'`: All panels stay in the DOM, inactive ones are hidden via CSS `display: none`.
 *   Use this to preserve component state across tab switches.
 */
export type TabRenderMode = 'conditional' | 'persistent';

/**
 * Default configuration for dynamic tabs.
 */
export const DEFAULT_TAB_CONFIG: Required<Omit<DynamicTabConfig, 'label' | 'data' | 'icon' | 'id'>> = {
  closable: true,
  activate: true,
};
