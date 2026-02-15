import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TAB_DATA, TAB_REF, TabRef, ButtonComponent, InputComponent } from '@m1z23r/ngx-ui';

export interface SampleTabData {
  title: string;
  content: string;
}

@Component({
  selector: 'app-sample-tab',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="sample-tab">
      <h3>{{ data.title }}</h3>
      <p>{{ data.content }}</p>

      <ui-input
        label="Edit title"
        [(value)]="editedTitle"
        style="margin: 1rem 0; max-width: 300px;"
      />

      <div class="sample-tab__actions">
        <ui-button size="sm" (clicked)="save()">Save & Close</ui-button>
        <ui-button size="sm" variant="ghost" color="secondary" (clicked)="close()">Close</ui-button>
      </div>
    </div>
  `,
  styles: [`
    .sample-tab {
      padding: 1rem;
    }

    .sample-tab h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .sample-tab p {
      margin: 0 0 1rem;
      color: var(--ui-text-muted);
    }

    .sample-tab__actions {
      display: flex;
      gap: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleTabComponent {
  protected readonly data = inject(TAB_DATA) as SampleTabData;
  private readonly tabRef = inject(TAB_REF) as TabRef<string>;

  protected readonly editedTitle = signal(this.data.title);

  save(): void {
    this.tabRef.close(this.editedTitle());
  }

  close(): void {
    this.tabRef.close();
  }
}
