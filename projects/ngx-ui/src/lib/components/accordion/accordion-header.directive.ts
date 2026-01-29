import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[uiAccordionHeader]',
  standalone: true,
})
export class AccordionHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}
