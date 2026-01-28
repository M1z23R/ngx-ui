import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-dropdown-divider',
  standalone: true,
  template: `<div class="ui-dropdown-divider" role="separator"></div>`,
  styles: [`
    :host {
      display: block;
    }

    .ui-dropdown-divider {
      height: 1px;
      margin: var(--ui-spacing-xs) 0;
      background-color: var(--ui-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownDividerComponent {}
