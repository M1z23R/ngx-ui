import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
  Injector,
  effect,
  viewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { TabsService } from './tabs.service';
import { DynamicTab } from './tab.config';

export type DynamicTabsVariant = 'default' | 'pills' | 'underline';
export type DynamicTabsSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-dynamic-tabs',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet],
  template: `
    <div class="ui-tabs" [class]="tabsClasses()">
      <div
        #tabList
        class="ui-tabs__list"
        role="tablist"
        [attr.aria-label]="ariaLabel()"
      >
        @for (tab of tabs(); track tab.id) {
          @let active = tab.id === activeTabId();
          <button
            type="button"
            class="ui-tabs__tab"
            role="tab"
            [class.ui-tabs__tab--active]="active"
            [class.ui-tabs__tab--closable]="tab.closable"
            [attr.aria-selected]="active"
            [attr.aria-controls]="'panel-' + tab.id"
            [attr.tabindex]="active ? 0 : -1"
            (click)="selectTab(tab)"
            (keydown)="handleKeyDown($event, tab)"
          >
            @if (tab.icon) {
              <span class="ui-tabs__tab-icon">
                <ng-container *ngTemplateOutlet="tab.icon" />
              </span>
            }
            <span class="ui-tabs__tab-label">{{ tab.label }}</span>
            @if (tab.closable) {
              <button
                type="button"
                class="ui-tabs__tab-close"
                aria-label="Close tab"
                (click)="closeTab($event, tab)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            }
          </button>
        }
        @if (variant() === 'underline') {
          <span
            class="ui-tabs__indicator"
            [style.left.px]="indicatorLeft()"
            [style.width.px]="indicatorWidth()"
          ></span>
        }
      </div>
      <div class="ui-tabs__panels">
        @for (tab of tabs(); track tab.id) {
          @if (tab.id === activeTabId()) {
            <div
              class="ui-tab-panel"
              role="tabpanel"
              [attr.id]="'panel-' + tab.id"
            >
              <ng-container
                *ngComponentOutlet="tab.component; injector: getInjector(tab)"
              />
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: ['./tabs.component.scss', './dynamic-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicTabsComponent {
  private readonly tabsService = inject(TabsService);
  private readonly injector = inject(Injector);

  readonly variant = input<DynamicTabsVariant>('default');
  readonly size = input<DynamicTabsSize>('md');
  readonly ariaLabel = input<string>('');

  private readonly tabList = viewChild<ElementRef<HTMLElement>>('tabList');

  protected readonly indicatorLeft = signal(0);
  protected readonly indicatorWidth = signal(0);

  readonly tabs = this.tabsService.tabs;
  readonly activeTabId = this.tabsService.activeTabId;

  private readonly injectorCache = new Map<string, Injector>();

  protected readonly tabsClasses = computed(() => {
    return `ui-tabs--${this.variant()} ui-tabs--${this.size()}`;
  });

  constructor() {
    effect(() => {
      const _ = this.activeTabId();
      this.updateIndicator();
    });

    // Clean up injector cache when tabs are removed
    effect(() => {
      const currentTabs = this.tabs();
      const currentIds = new Set(currentTabs.map((t) => t.id));
      for (const id of this.injectorCache.keys()) {
        if (!currentIds.has(id)) {
          this.injectorCache.delete(id);
        }
      }
    });
  }

  protected getInjector(tab: DynamicTab): Injector {
    let injector = this.injectorCache.get(tab.id);
    if (!injector) {
      injector = this.tabsService._createInjector(
        this.injector,
        tab.data,
        tab.tabRef
      );
      this.injectorCache.set(tab.id, injector);
    }
    return injector;
  }

  protected selectTab(tab: DynamicTab): void {
    this.tabsService.activateById(tab.id);
  }

  protected closeTab(event: Event, tab: DynamicTab): void {
    event.stopPropagation();
    tab.tabRef.close();
  }

  protected handleKeyDown(event: KeyboardEvent, currentTab: DynamicTab): void {
    const tabList = this.tabs();
    if (tabList.length === 0) return;

    const currentIndex = tabList.findIndex((t) => t.id === currentTab.id);
    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + tabList.length) % tabList.length;
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % tabList.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabList.length - 1;
        break;
      case 'Delete':
        if (currentTab.closable) {
          event.preventDefault();
          currentTab.tabRef.close();
        }
        return;
      default:
        return;
    }

    if (nextIndex >= 0) {
      const nextTab = tabList[nextIndex];
      this.tabsService.activateById(nextTab.id);
      this.focusTab(nextIndex);
    }
  }

  private focusTab(index: number): void {
    const tabListEl = this.tabList()?.nativeElement;
    if (!tabListEl) return;
    const buttons = tabListEl.querySelectorAll<HTMLButtonElement>(
      '.ui-tabs__tab'
    );
    buttons[index]?.focus();
  }

  private updateIndicator(): void {
    if (this.variant() !== 'underline') return;

    const tabListEl = this.tabList()?.nativeElement;
    if (!tabListEl) return;

    const buttons = tabListEl.querySelectorAll<HTMLButtonElement>(
      '.ui-tabs__tab'
    );
    const activeId = this.activeTabId();
    const tabs = this.tabs();
    const activeIndex = tabs.findIndex((t) => t.id === activeId);

    if (activeIndex >= 0 && activeIndex < buttons.length) {
      const activeButton = buttons[activeIndex];
      this.indicatorLeft.set(activeButton.offsetLeft);
      this.indicatorWidth.set(activeButton.offsetWidth);
    }
  }
}
