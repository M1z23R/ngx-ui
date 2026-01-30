import {
  Component,
  input,
  model,
  output,
  computed,
  contentChildren,
  signal,
  effect,
  AfterContentInit,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TabComponent } from './tab.component';
import { TabActivePipe } from './tab-active.pipe';

export type TabsVariant = 'default' | 'pills' | 'underline';
export type TabsSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [NgTemplateOutlet, TabActivePipe],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentInit {
  readonly variant = input<TabsVariant>('default');
  readonly size = input<TabsSize>('md');
  readonly ariaLabel = input<string>('');

  readonly activeTab = model<string | number>(0);

  readonly tabs = contentChildren(TabComponent);

  private readonly tabList = viewChild<ElementRef<HTMLElement>>('tabList');

  protected readonly indicatorLeft = signal(0);
  protected readonly indicatorWidth = signal(0);

  protected readonly tabsClasses = computed(() => {
    return `ui-tabs--${this.variant()} ui-tabs--${this.size()}`;
  });

  constructor() {
    // Update indicator position when active tab changes
    effect(() => {
      const _ = this.activeTab();
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => this.updateIndicator(), 0);
    });
  }

  ngAfterContentInit(): void {
    this._setupTabs();
    // Initial indicator position
    setTimeout(() => this.updateIndicator(), 0);
  }

  private _setupTabs(): void {
    const tabList = this.tabs();
    tabList.forEach((tab, index) => {
      tab._setTabsParent(this, index);
    });
  }

  protected selectTab(tab: TabComponent, index: number): void {
    if (tab.disabled()) return;
    const tabId = tab.id();
    const value = tabId !== '' && tabId !== undefined ? tabId : index;
    this.activeTab.set(value);
  }

  protected handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    const tabList = this.tabs();
    const enabledTabs = tabList
      .map((t, i) => ({ tab: t, index: i }))
      .filter(({ tab }) => !tab.disabled());

    if (enabledTabs.length === 0) return;

    const currentEnabledIndex = enabledTabs.findIndex(({ index }) => index === currentIndex);
    let nextEnabledIndex = -1;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextEnabledIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextEnabledIndex = (currentEnabledIndex + 1) % enabledTabs.length;
        break;
      case 'Home':
        event.preventDefault();
        nextEnabledIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextEnabledIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    if (nextEnabledIndex >= 0) {
      const { tab, index } = enabledTabs[nextEnabledIndex];
      this.selectTab(tab, index);
      this.focusTab(index);
    }
  }

  private focusTab(index: number): void {
    const tabListEl = this.tabList()?.nativeElement;
    if (!tabListEl) return;
    const buttons = tabListEl.querySelectorAll<HTMLButtonElement>('.ui-tabs__tab');
    buttons[index]?.focus();
  }

  private updateIndicator(): void {
    if (this.variant() !== 'underline') return;

    const tabListEl = this.tabList()?.nativeElement;
    if (!tabListEl) return;

    const buttons = tabListEl.querySelectorAll<HTMLButtonElement>('.ui-tabs__tab');
    const activeIndex = this.getActiveIndex();

    if (activeIndex >= 0 && activeIndex < buttons.length) {
      const activeButton = buttons[activeIndex];
      this.indicatorLeft.set(activeButton.offsetLeft);
      this.indicatorWidth.set(activeButton.offsetWidth);
    }
  }

  private getActiveIndex(): number {
    const active = this.activeTab();
    const tabList = this.tabs();

    for (let i = 0; i < tabList.length; i++) {
      const tab = tabList[i];
      const tabId = tab.id();
      if (tabId !== '' && tabId !== undefined) {
        if (active === tabId) return i;
      } else if (active === i) {
        return i;
      }
    }
    return 0;
  }

  /** @internal */
  _isTabActive(tab: TabComponent, index: number): boolean {
    const active = this.activeTab();
    const tabId = tab.id();
    if (tabId !== '' && tabId !== undefined) {
      return active === tabId;
    }
    return active === index;
  }
}
