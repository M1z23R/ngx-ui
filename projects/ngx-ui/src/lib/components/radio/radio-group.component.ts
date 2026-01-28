import {
  Component,
  input,
  model,
  output,
  computed,
  contentChildren,
  AfterContentInit,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RadioComponent } from './radio.component';

export type RadioGroupOrientation = 'horizontal' | 'vertical';
export type RadioGroupSize = 'sm' | 'md' | 'lg';
export type RadioGroupVariant = 'default' | 'segmented';

@Component({
  selector: 'ui-radio-group',
  standalone: true,
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent<T = unknown> implements AfterContentInit {
  readonly name = input<string>(`radio-group-${Math.random().toString(36).slice(2, 9)}`);
  readonly disabled = input(false);
  readonly orientation = input<RadioGroupOrientation>('vertical');
  readonly size = input<RadioGroupSize>('md');
  readonly variant = input<RadioGroupVariant>('default');
  readonly ariaLabel = input<string>('');

  readonly value = model<T | null>(null);

  readonly changed = output<T | null>();

  readonly radios = contentChildren(RadioComponent);

  protected readonly groupClasses = computed(() => {
    const classes: string[] = [];
    const v = this.variant();

    if (v === 'segmented') {
      classes.push('ui-radio-group--segmented');
      classes.push(`ui-radio-group--${this.size()}`);
    } else {
      classes.push(`ui-radio-group--${this.orientation()}`);
    }

    if (this.disabled()) {
      classes.push('ui-radio-group--disabled');
    }
    return classes.join(' ');
  });

  constructor() {
    // Sync value changes to child radios
    effect(() => {
      const currentValue = this.value();
      const radioList = this.radios();
      radioList.forEach(radio => {
        radio._setChecked(radio.value() === currentValue);
      });
    });
  }

  ngAfterContentInit(): void {
    this._setupRadios();
  }

  private _setupRadios(): void {
    const radioList = this.radios();
    radioList.forEach((radio, index) => {
      radio._setGroup(this);
      radio._setIndex(index);
    });
  }

  /** @internal */
  _selectRadio(value: T): void {
    if (this.disabled()) return;
    this.value.set(value);
    this.changed.emit(value);
  }

  /** @internal */
  _handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    const radioList = this.radios();
    const enabledRadios = radioList.filter(r => !r.disabled());
    if (enabledRadios.length === 0) return;

    const currentEnabledIndex = enabledRadios.findIndex(
      r => r._index() === currentIndex
    );

    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentEnabledIndex + 1) % enabledRadios.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentEnabledIndex - 1 + enabledRadios.length) % enabledRadios.length;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        const currentRadio = radioList[currentIndex];
        if (currentRadio && !currentRadio.disabled()) {
          this._selectRadio(currentRadio.value() as T);
        }
        return;
      default:
        return;
    }

    if (nextIndex >= 0) {
      const nextRadio = enabledRadios[nextIndex];
      nextRadio._focus();
      this._selectRadio(nextRadio.value() as T);
    }
  }
}
