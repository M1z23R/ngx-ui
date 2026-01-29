import {
  Component,
  input,
  computed,
  contentChildren,
  AfterContentInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AccordionItemComponent } from './accordion-item.component';

export type AccordionVariant = 'default' | 'bordered' | 'separated';

@Component({
  selector: 'ui-accordion',
  standalone: true,
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent implements AfterContentInit {
  readonly multi = input(false);
  readonly variant = input<AccordionVariant>('default');

  readonly items = contentChildren(AccordionItemComponent);

  protected readonly accordionClasses = computed(() => {
    return `ui-accordion--${this.variant()}`;
  });

  ngAfterContentInit(): void {
    this._setupItems();
  }

  private _setupItems(): void {
    const itemList = this.items();
    itemList.forEach((item, index) => {
      item._setParent(this, index);
    });
  }

  /** @internal */
  _onItemToggled(expandedItem: AccordionItemComponent): void {
    if (this.multi()) return;
    const itemList = this.items();
    for (const item of itemList) {
      if (item !== expandedItem && item.isExpanded()) {
        item.collapse();
      }
    }
  }
}
