import {
  Component,
  input,
  signal,
  computed,
  TemplateRef,
  contentChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AccordionHeaderDirective } from './accordion-header.directive';
import type { AccordionComponent } from './accordion.component';

@Component({
  selector: 'ui-accordion-item',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent {
  readonly header = input('');
  readonly disabled = input(false);
  readonly expanded = input(false);

  private readonly headerDirective = contentChild(AccordionHeaderDirective);

  /** @internal */
  readonly _index = signal(0);

  private _parent: AccordionComponent | null = null;

  readonly isExpanded = signal(false);

  readonly headerTemplate = computed<TemplateRef<unknown> | null>(() => {
    return this.headerDirective()?.templateRef ?? null;
  });

  /** @internal */
  _setParent(parent: AccordionComponent, index: number): void {
    this._parent = parent;
    this._index.set(index);
    if (this.expanded()) {
      this.isExpanded.set(true);
    }
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.isExpanded()) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand(): void {
    if (this.disabled()) return;
    this.isExpanded.set(true);
    this._parent?._onItemToggled(this);
  }

  collapse(): void {
    this.isExpanded.set(false);
  }
}
