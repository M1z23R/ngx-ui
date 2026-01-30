import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Loadable, LOADABLE } from '../../loading/loadable';

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'elevated';
export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  providers: [{ provide: LOADABLE, useExisting: ButtonComponent }],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements Loadable {
  readonly variant = input<ButtonVariant>('default');
  readonly color = input<ButtonColor>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly clicked = output<MouseEvent>();

  /** Internal loading state set by LoadingDirective */
  private readonly directiveLoading = signal(false);

  /** Combined loading state - true if either input or directive loading is true */
  protected readonly isLoading = computed(() => this.loading() || this.directiveLoading());

  protected readonly buttonClasses = computed(() => {
    return `ui-button--${this.variant()} ui-button--${this.color()} ui-button--${this.size()}`;
  });

  protected handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.isLoading()) {
      this.clicked.emit(event);
    }
  }

  /** Loadable implementation - called by LoadingDirective */
  setLoading(loading: boolean): void {
    this.directiveLoading.set(loading);
  }
}
