import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  HostListener,
  ElementRef,
  OnInit,
} from '@angular/core';
import { DIALOG_REF } from './dialog.config';
import { DialogRef } from './dialog-ref';

/**
 * Modal wrapper component with backdrop, header, body, and footer slots.
 * Uses content projection for flexible content.
 *
 * @example
 * ```html
 * <ui-modal [title]="'Confirm Action'" [size]="'md'" [closeOnBackdropClick]="true">
 *   <p>Are you sure you want to proceed?</p>
 *
 *   <ng-container footer>
 *     <ui-button variant="outline" (clicked)="dialogRef.close()">Cancel</ui-button>
 *     <ui-button variant="primary" (clicked)="confirm()">Confirm</ui-button>
 *   </ng-container>
 * </ui-modal>
 * ```
 */
@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    <div class="ui-modal__backdrop" (click)="onBackdropClick($event)">
      <div
        class="ui-modal__container"
        [class]="containerClasses()"
        [style.width]="width()"
        [style.max-width]="maxWidth()"
        role="dialog"
        aria-modal="true"
      >
        @if (title()) {
          <div class="ui-modal__header">
            <h2 class="ui-modal__title">{{ title() }}</h2>
            @if (showCloseButton()) {
              <button
                type="button"
                class="ui-modal__close"
                aria-label="Close"
                (click)="close()"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            }
          </div>
        }

        <div class="ui-modal__body">
          <ng-content />
        </div>

        <div class="ui-modal__footer">
          <ng-content select="[footer]" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ui-modal__backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--ui-spacing-md);
      background-color: rgba(0, 0, 0, 0.5);
      animation: fadeIn var(--ui-transition-fast);
    }

    .ui-modal__container {
      position: relative;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - var(--ui-spacing-xl) * 2);
      background-color: var(--ui-bg);
      border-radius: var(--ui-radius-lg);
      box-shadow: var(--ui-shadow-lg);
      animation: slideIn var(--ui-transition-normal);
    }

    /* Size variants */
    .ui-modal--sm { max-width: 400px; }
    .ui-modal--md { max-width: 560px; }
    .ui-modal--lg { max-width: 800px; }
    .ui-modal--xl { max-width: 1140px; }
    .ui-modal--full {
      max-width: calc(100vw - var(--ui-spacing-xl) * 2);
      max-height: calc(100vh - var(--ui-spacing-xl) * 2);
    }

    .ui-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--ui-spacing-md) var(--ui-spacing-lg);
      border-bottom: 1px solid var(--ui-border);
    }

    .ui-modal__title {
      margin: 0;
      font-size: var(--ui-font-lg);
      font-weight: 600;
      color: var(--ui-text);
    }

    .ui-modal__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      margin: calc(var(--ui-spacing-sm) * -1);
      color: var(--ui-text-muted);
      background: transparent;
      border: none;
      border-radius: var(--ui-radius-sm);
      cursor: pointer;
      transition: all var(--ui-transition-fast);
    }

    .ui-modal__close:hover {
      color: var(--ui-text);
      background-color: var(--ui-bg-hover);
    }

    .ui-modal__close:focus-visible {
      outline: 2px solid var(--ui-primary);
      outline-offset: 2px;
    }

    .ui-modal__body {
      flex: 1;
      padding: var(--ui-spacing-lg);
      overflow-y: auto;
    }

    .ui-modal__footer {
      display: flex;
      gap: var(--ui-spacing-sm);
      justify-content: flex-end;
      padding: var(--ui-spacing-md) var(--ui-spacing-lg);
      border-top: 1px solid var(--ui-border);
    }

    .ui-modal__footer:empty {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit {
  private readonly dialogRef = inject(DIALOG_REF, { optional: true }) as DialogRef | null;
  private readonly elementRef = inject(ElementRef);

  /** Title displayed in the modal header */
  readonly title = input<string>();

  /** Modal size preset */
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  /** Custom width (overrides size preset) */
  readonly width = input<string>();

  /** Custom max-width (overrides size preset) */
  readonly maxWidth = input<string>();

  /** Whether clicking the backdrop closes the modal */
  readonly closeOnBackdropClick = input(true);

  /** Whether pressing Escape closes the modal */
  readonly closeOnEscape = input(true);

  /** Whether to show the close button in the header */
  readonly showCloseButton = input(true);

  /** Custom CSS class for the container */
  readonly panelClass = input<string>();

  ngOnInit(): void {
    // Read config from host element if opened via DialogService
    const hostElement = this.elementRef.nativeElement as HTMLElement;
    const configJson = hostElement.parentElement?.dataset?.['dialogConfig'];
    if (configJson) {
      // Config was passed via DialogService, values are already set via inputs
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.closeOnEscape()) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdropClick()) {
      this.close();
    }
  }

  close(): void {
    this.dialogRef?.close();
  }

  protected containerClasses(): string {
    const classes = [`ui-modal--${this.size()}`];
    if (this.panelClass()) {
      classes.push(this.panelClass()!);
    }
    return classes.join(' ');
  }
}
