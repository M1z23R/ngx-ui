import {
  Component,
  input,
  signal,
  computed,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  model,
} from '@angular/core';
import type { RadioGroupComponent, RadioGroupVariant } from './radio-group.component';

@Component({
  selector: 'ui-radio',
  standalone: true,
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent<T = unknown> {
  readonly value = model.required<T>();
  readonly disabled = input(false);

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  /** @internal */
  readonly _checked = signal(false);
  /** @internal */
  readonly _index = signal(0);
  /** @internal */
  readonly _variant = signal<RadioGroupVariant>('default');

  private _group: RadioGroupComponent<T> | null = null;

  protected readonly _groupName = computed(() => {
    return this._group?.name() ?? '';
  });

  protected readonly isDisabled = computed(() => {
    return this.disabled() || (this._group?.disabled() ?? false);
  });

  protected readonly radioClasses = computed(() => {
    const size = this._group?.size() ?? 'md';
    const variant = this._variant();
    return `ui-radio--${variant} ui-radio--${size}`;
  });

  /** @internal */
  _setGroup(group: RadioGroupComponent<T>): void {
    this._group = group;
    this._variant.set(group.variant());
  }

  /** @internal */
  _setIndex(index: number): void {
    this._index.set(index);
  }

  /** @internal */
  _setChecked(checked: boolean): void {
    this._checked.set(checked);
  }

  /** @internal */
  _focus(): void {
    this.inputEl().nativeElement.focus();
  }

  protected handleChange(): void {
    if (this.isDisabled()) return;
    this._group?._selectRadio(this.value());
  }

  protected handleKeyDown(event: KeyboardEvent): void {
    this._group?._handleKeyDown(event, this._index());
  }
}
