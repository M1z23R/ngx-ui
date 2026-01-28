import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[uiDropdownTrigger]',
  standalone: true,
  host: {
    '(click)': 'toggleDropdown.emit()',
    '(keydown.enter)': 'toggleDropdown.emit()',
    '(keydown.space)': 'toggleDropdown.emit(); $event.preventDefault()',
    '(keydown.arrowDown)': 'openDropdown.emit(); $event.preventDefault()',
    '[attr.aria-haspopup]': '"menu"',
  },
})
export class DropdownTriggerDirective {
  readonly elementRef = inject(ElementRef);

  readonly toggleDropdown = output<void>();
  readonly openDropdown = output<void>();
}
