import {
  Component,
  input,
  signal,
  computed,
  TemplateRef,
  contentChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TabIconDirective } from './tab-icon.directive';
import type { TabRenderMode } from './tab.config';
import type { TabsComponent } from './tabs.component';

@Component({
  selector: 'ui-tab, [ui-tab]',
  standalone: true,
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  readonly id = input<string | number>('');
  readonly label = input.required<string>();
  readonly disabled = input(false);

  private readonly iconDirective = contentChild(TabIconDirective);

  /** @internal */
  readonly _index = signal(0);
  /** @internal */
  readonly _renderMode = signal<TabRenderMode>('conditional');

  private _parent: TabsComponent | null = null;

  readonly iconTemplate = computed<TemplateRef<unknown> | null>(() => {
    return this.iconDirective()?.templateRef ?? null;
  });

  protected readonly isActive = computed(() => {
    if (!this._parent) return false;
    return this._parent._isTabActive(this, this._index());
  });

  /** @internal */
  _setTabsParent(parent: TabsComponent, index: number): void {
    this._parent = parent;
    this._index.set(index);
  }
}
