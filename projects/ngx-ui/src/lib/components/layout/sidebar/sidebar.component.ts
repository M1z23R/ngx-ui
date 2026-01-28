import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly sidebarService = inject(SidebarService);
}
