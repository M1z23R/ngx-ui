import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-navbar',
  standalone: true,
  template: `
    <header class="ui-navbar">
      <div class="ui-navbar__start">
        <ng-content select="[slot=start]" />
      </div>
      <div class="ui-navbar__center">
        <ng-content select="[slot=center]" />
      </div>
      <div class="ui-navbar__end">
        <ng-content select="[slot=end]" />
      </div>
      <ng-content />
    </header>
  `,
  styles: [`
    :host {
      display: block;
      grid-area: navbar;
    }

    .ui-navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--ui-navbar-height);
      padding: 0 var(--ui-spacing-md);
      background-color: var(--ui-bg);
      border-bottom: 1px solid var(--ui-border);
    }

    .ui-navbar__start,
    .ui-navbar__center,
    .ui-navbar__end {
      display: flex;
      align-items: center;
      gap: var(--ui-spacing-sm);
    }

    .ui-navbar__start {
      justify-content: flex-start;
    }

    .ui-navbar__center {
      flex: 1;
      justify-content: center;
    }

    .ui-navbar__end {
      justify-content: flex-end;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
