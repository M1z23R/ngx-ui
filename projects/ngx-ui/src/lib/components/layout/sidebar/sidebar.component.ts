import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  template: `
    <aside class="ui-sidebar"
           [class.ui-sidebar--collapsed]="sidebarService.collapsed()"
           [class.ui-sidebar--mobile]="sidebarService.isMobile()"
           [class.ui-sidebar--mobile-open]="sidebarService.mobileOpen()">
      <div class="ui-sidebar__header">
        <ng-content select="[slot=header]" />
      </div>
      <nav class="ui-sidebar__nav">
        <ng-content />
      </nav>
      <div class="ui-sidebar__footer">
        <ng-content select="[slot=footer]" />
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      grid-area: sidebar;
    }

    .ui-sidebar {
      display: flex;
      flex-direction: column;
      width: var(--ui-sidebar-width);
      height: 100%;
      background-color: var(--ui-bg);
      border-right: 1px solid var(--ui-border);
      transition: width var(--ui-transition-normal), transform var(--ui-transition-normal);
      overflow: hidden;
    }

    .ui-sidebar--collapsed {
      width: var(--ui-sidebar-collapsed-width);
    }

    .ui-sidebar__header {
      display: flex;
      align-items: center;
      height: var(--ui-navbar-height);
      padding: 0 var(--ui-spacing-md);
      border-bottom: 1px solid var(--ui-border);
      flex-shrink: 0;
    }

    .ui-sidebar__nav {
      flex: 1;
      padding: var(--ui-spacing-sm);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .ui-sidebar__footer {
      padding: var(--ui-spacing-sm);
      border-top: 1px solid var(--ui-border);
      flex-shrink: 0;
    }

    /* Collapsed state padding */
    .ui-sidebar--collapsed .ui-sidebar__header,
    .ui-sidebar--collapsed .ui-sidebar__nav,
    .ui-sidebar--collapsed .ui-sidebar__footer {
      padding-inline: var(--ui-spacing-xs);
    }

    /* Mobile styles */
    .ui-sidebar--mobile {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 50;
      transform: translateX(-100%);
      box-shadow: var(--ui-shadow-lg);
    }

    .ui-sidebar--mobile.ui-sidebar--mobile-open {
      transform: translateX(0);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly sidebarService = inject(SidebarService);
}
