import { Component, input, model, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  readonly type = input<InputType>('text');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly id = input<string>('');

  readonly value = model<string | number>('');

  private static nextId = 0;
  private readonly generatedId = `ui-input-${++InputComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);
}
