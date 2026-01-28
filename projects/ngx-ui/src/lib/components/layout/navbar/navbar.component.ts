import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
