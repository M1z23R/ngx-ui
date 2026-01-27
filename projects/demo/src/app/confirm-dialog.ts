import { Component, inject } from '@angular/core';
import { ButtonComponent, ModalComponent, DIALOG_DATA, DIALOG_REF, DialogRef } from '@m1z23r/ngx-ui';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-modal [title]="data.title" size="sm">
      <p>{{ data.message }}</p>

      <ng-container footer>
        <ui-button variant="outline" (clicked)="dialogRef.close(false)">
          {{ data.cancelText || 'Cancel' }}
        </ui-button>
        <ui-button variant="primary" (clicked)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirm' }}
        </ui-button>
      </ng-container>
    </ui-modal>
  `,
  styles: [`
    p {
      margin: 0;
      color: var(--ui-text-muted);
    }
  `],
})
export class ConfirmDialog {
  readonly dialogRef = inject(DIALOG_REF) as DialogRef<boolean>;
  readonly data = inject(DIALOG_DATA) as ConfirmDialogData;
}
