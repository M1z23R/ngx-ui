import { InjectionToken } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastConfig {
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Toast variant/type */
  variant?: ToastVariant;
  /** Duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Position on screen */
  position?: ToastPosition;
  /** Show close button */
  dismissible?: boolean;
  /** Show progress bar for auto-dismiss */
  showProgress?: boolean;
  /** Max visible toasts (0 = unlimited, oldest dismissed when exceeded) */
  maxVisible?: number;
}

export interface ToastData extends Required<Omit<ToastConfig, 'title' | 'maxVisible'>> {
  id: string;
  title?: string;
}

export const DEFAULT_TOAST_CONFIG: Omit<Required<ToastConfig>, 'message' | 'title'> = {
  variant: 'info',
  duration: 5000,
  position: 'top-right',
  dismissible: true,
  showProgress: true,
  maxVisible: 3,
};

export const TOAST_DATA = new InjectionToken<ToastData>('TOAST_DATA');
