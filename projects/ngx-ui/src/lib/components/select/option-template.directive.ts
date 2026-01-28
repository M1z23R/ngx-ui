import { Directive, TemplateRef, inject } from '@angular/core';

export interface OptionTemplateContext<T> {
  $implicit: T;
  option: T;
  selected: boolean;
  disabled: boolean;
}

@Directive({
  selector: '[uiOptionTemplate]',
  standalone: true,
})
export class OptionTemplateDirective<T = unknown> {
  readonly templateRef = inject(TemplateRef<OptionTemplateContext<T>>);
}
