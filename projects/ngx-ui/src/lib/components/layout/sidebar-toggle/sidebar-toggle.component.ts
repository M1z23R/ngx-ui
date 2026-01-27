import { Component, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'ui-sidebar-toggle',
  standalone: true,
  template: `
    <button class="ui-sidebar-toggle"
            type="button"
            [class.ui-sidebar-toggle--mobile-only]="mobileOnly()"
            [attr.aria-expanded]="sidebarService.isMobile() ? sidebarService.mobileOpen() : !sidebarService.collapsed()"
            aria-label="Toggle sidebar"
            (click)="sidebarService.toggle()">
      <svg class="ui-sidebar-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  `,
  styles: [`
    .ui-sidebar-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: var(--ui-radius-md);
      cursor: pointer;
      color: var(--ui-text);
      transition: background-color var(--ui-transition-fast);
    }

    .ui-sidebar-toggle:hover {
      background-color: var(--ui-bg-hover);
    }

    .ui-sidebar-toggle:focus-visible {
      outline: 2px solid var(--ui-primary);
      outline-offset: 2px;
    }

    .ui-sidebar-toggle__icon {
      width: 24px;
      height: 24px;
    }

    .ui-sidebar-toggle--mobile-only {
      display: none;
    }

    @media (max-width: 767px) {
      .ui-sidebar-toggle--mobile-only {
        display: inline-flex;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarToggleComponent {
  protected readonly sidebarService = inject(SidebarService);
  readonly mobileOnly = input(true);
}
