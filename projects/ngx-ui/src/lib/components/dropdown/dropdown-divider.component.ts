import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-dropdown-divider',
  standalone: true,
  templateUrl: './dropdown-divider.component.html',
  styleUrl: './dropdown-divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownDividerComponent {}
