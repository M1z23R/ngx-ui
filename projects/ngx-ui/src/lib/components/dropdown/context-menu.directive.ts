import { Directive, HostListener, input } from '@angular/core';
import { DropdownComponent } from './dropdown.component';

@Directive({
  selector: '[uiContextMenu]',
  standalone: true,
})
export class ContextMenuDirective {
  readonly uiContextMenu = input.required<DropdownComponent>();

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.uiContextMenu().openAt(event.clientX, event.clientY);
  }
}
