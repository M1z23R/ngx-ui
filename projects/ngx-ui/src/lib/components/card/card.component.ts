import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('md');
  readonly clickable = input(false);

  readonly clicked = output<void>();

  protected readonly cardClass = computed(() => {
    const classes = ['ui-card', `ui-card--${this.variant()}`, `ui-card--padding-${this.padding()}`];
    if (this.clickable()) classes.push('ui-card--clickable');
    return classes.join(' ');
  });

  protected onClick(): void {
    if (this.clickable()) {
      this.clicked.emit();
    }
  }
}
