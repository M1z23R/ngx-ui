import { InjectionToken } from '@angular/core';
import { DialogRef } from './dialog-ref';

/**
 * Injection token for dialog data passed to the component.
 */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

/**
 * Injection token for the dialog reference.
 */
export const DIALOG_REF = new InjectionToken<DialogRef>('DIALOG_REF');

/**
 * Size options for the modal.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Configuration options for opening a dialog.
 */
export interface DialogConfig<TData = unknown> {
  /** Data to pass to the dialog component via DIALOG_DATA injection token */
  data?: TData;
  /** Width of the modal (CSS value, e.g., '500px', '80%') */
  width?: string;
  /** Maximum width of the modal (CSS value) */
  maxWidth?: string;
  /** Predefined size preset */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the dialog */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the dialog */
  closeOnEscape?: boolean;
  /** Custom CSS class to add to the modal container */
  panelClass?: string;
}

/**
 * Default dialog configuration.
 */
export const DEFAULT_DIALOG_CONFIG: Required<Omit<DialogConfig, 'data' | 'width' | 'maxWidth' | 'panelClass'>> = {
  size: 'md',
  closeOnBackdropClick: true,
  closeOnEscape: true,
};
