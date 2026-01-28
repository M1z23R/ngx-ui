import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-content',
  standalone: true,
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {}
