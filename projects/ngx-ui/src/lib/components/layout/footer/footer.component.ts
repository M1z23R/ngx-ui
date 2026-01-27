import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ui-footer',
  standalone: true,
  template: `
    <footer class="ui-footer">
      <ng-content />
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      grid-area: footer;
    }

    .ui-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: var(--ui-footer-height);
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      background-color: var(--ui-bg);
      border-top: 1px solid var(--ui-border);
      color: var(--ui-text-muted);
      font-size: var(--ui-font-sm);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
