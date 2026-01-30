import { Component, input, model, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type SliderSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly size = input<SliderSize>('md');
  readonly disabled = input(false);
  readonly showValue = input(false);
  readonly label = input<string>('');

  readonly value = model(0);
  readonly valueCommit = output<number>();

  private static nextId = 0;
  private readonly generatedId = `ui-slider-${++SliderComponent.nextId}`;

  protected readonly inputId = computed(() => this.generatedId);

  protected readonly sliderClasses = computed(() => `ui-slider--${this.size()}`);

  protected readonly fillPercent = computed(() => {
    const min = this.min();
    const max = this.max();
    const range = max - min;
    if (range <= 0) return '0%';
    const percent = ((this.value() - min) / range) * 100;
    return `${Math.max(0, Math.min(100, percent))}%`;
  });
}
