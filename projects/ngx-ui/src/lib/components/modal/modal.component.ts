import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  HostListener,
  ElementRef,
  OnInit,
} from '@angular/core';
import { DIALOG_REF } from '../../dialog/dialog.config';
import { DialogRef } from '../../dialog/dialog-ref';

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
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit {
  private readonly dialogRef = inject(DIALOG_REF, { optional: true }) as DialogRef | null;
  private readonly elementRef = inject(ElementRef);

  /** Tracks if mousedown started on the backdrop (to prevent close on drag-out) */
  private readonly mouseDownOnBackdrop = signal(false);

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

  onBackdropMouseDown(event: MouseEvent): void {
    this.mouseDownOnBackdrop.set(event.target === event.currentTarget);
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close if both mousedown AND mouseup happened on the backdrop
    if (
      this.mouseDownOnBackdrop() &&
      event.target === event.currentTarget &&
      this.closeOnBackdropClick()
    ) {
      this.close();
    }
    this.mouseDownOnBackdrop.set(false);
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
