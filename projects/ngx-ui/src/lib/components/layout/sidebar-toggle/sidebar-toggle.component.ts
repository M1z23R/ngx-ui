import { Component, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'ui-sidebar-toggle',
  standalone: true,
  templateUrl: './sidebar-toggle.component.html',
  styleUrl: './sidebar-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarToggleComponent {
  protected readonly sidebarService = inject(SidebarService);
  readonly mobileOnly = input(true);
}
