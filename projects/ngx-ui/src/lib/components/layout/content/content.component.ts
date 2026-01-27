import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-content',
  standalone: true,
  template: `
    <main class="ui-content">
      <ng-content />
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      grid-area: content;
      min-height: 0;
      overflow: hidden;
    }

    .ui-content {
      flex: 1;
      padding: var(--ui-spacing-lg);
      background-color: var(--ui-bg-secondary);
      overflow-y: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {}
