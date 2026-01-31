import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

export type ShellVariant = 'default' | 'header';

@Component({
  selector: 'ui-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly variant = input<ShellVariant>('default');
  protected readonly sidebarService = inject(SidebarService);
}
