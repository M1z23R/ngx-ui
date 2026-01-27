import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'ui-shell',
  standalone: true,
  template: `
    <div class="ui-shell"
         [class.ui-shell--sidebar-collapsed]="sidebarService.collapsed()"
         [class.ui-shell--mobile]="sidebarService.isMobile()"
         [class.ui-shell--mobile-open]="sidebarService.mobileOpen()">
      <ng-content />
      @if (sidebarService.isMobile() && sidebarService.mobileOpen()) {
        <div class="ui-shell__backdrop" (click)="sidebarService.closeMobile()"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .ui-shell {
      display: grid;
      grid-template-areas:
        "sidebar navbar"
        "sidebar content"
        "sidebar footer";
      grid-template-columns: var(--ui-sidebar-width) 1fr;
      grid-template-rows: var(--ui-navbar-height) 1fr auto;
      height: 100%;
      transition: grid-template-columns var(--ui-transition-normal);
    }

    .ui-shell--sidebar-collapsed {
      grid-template-columns: var(--ui-sidebar-collapsed-width) 1fr;
    }

    /* Mobile layout - sidebar is removed from grid flow */
    .ui-shell--mobile {
      grid-template-areas:
        "navbar"
        "content"
        "footer";
      grid-template-columns: 1fr;
    }

    .ui-shell__backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 40;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly sidebarService = inject(SidebarService);
}
