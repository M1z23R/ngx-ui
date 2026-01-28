import { Component, input, model, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly rows = input(3);
  readonly maxlength = input<number | null>(null);
  readonly resize = input<TextareaResize>('vertical');
  readonly id = input<string>('');

  readonly value = model<string>('');

  private static nextId = 0;
  private readonly generatedId = `ui-textarea-${++TextareaComponent.nextId}`;

  protected readonly textareaId = computed(() => this.id() || this.generatedId);

  protected readonly textareaClass = computed(() => {
    return `ui-textarea ui-textarea--resize-${this.resize()}`;
  });

  protected readonly isAtLimit = computed(() => {
    const max = this.maxlength();
    return max !== null && this.value().length >= max;
  });
}
