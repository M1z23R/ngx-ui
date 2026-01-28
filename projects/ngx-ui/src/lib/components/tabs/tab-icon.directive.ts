import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[uiTabIcon]',
  standalone: true,
})
export class TabIconDirective {
  readonly templateRef = inject(TemplateRef);
}
