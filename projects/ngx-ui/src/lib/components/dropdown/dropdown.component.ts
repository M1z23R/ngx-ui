import {
  Component,
  input,
  signal,
  contentChild,
  contentChildren,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  effect,
  HostListener,
} from '@angular/core';
import { DropdownTriggerDirective } from './dropdown-trigger.directive';
import { DropdownItemComponent } from './dropdown-item.component';

export type DropdownPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type DropdownAlign = 'start' | 'end';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  template: `
    <div class="ui-dropdown">
      <div class="ui-dropdown__trigger">
        <ng-content select="[uiDropdownTrigger]" />
      </div>

      @if (isOpen()) {
        <div
          class="ui-dropdown__menu"
          [class]="menuPositionClass()"
          [attr.role]="'menu'"
        >
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .ui-dropdown {
      position: relative;
    }

    .ui-dropdown__trigger {
      display: inline-block;
    }

    .ui-dropdown__menu {
      position: absolute;
      z-index: 1000;
      min-width: 160px;
      padding: var(--ui-spacing-xs) 0;
      background-color: var(--ui-dropdown-bg, var(--ui-bg));
      border: 1px solid var(--ui-dropdown-border, var(--ui-border));
      border-radius: var(--ui-dropdown-radius, var(--ui-radius-md));
      box-shadow: var(--ui-dropdown-shadow, var(--ui-shadow-lg));
    }

    /* Position variants */
    .ui-dropdown__menu--bottom-start {
      top: 100%;
      left: 0;
      margin-top: var(--ui-spacing-xs);
    }

    .ui-dropdown__menu--bottom-end {
      top: 100%;
      right: 0;
      margin-top: var(--ui-spacing-xs);
    }

    .ui-dropdown__menu--top-start {
      bottom: 100%;
      left: 0;
      margin-bottom: var(--ui-spacing-xs);
    }

    .ui-dropdown__menu--top-end {
      bottom: 100%;
      right: 0;
      margin-bottom: var(--ui-spacing-xs);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  readonly position = input<DropdownPosition>('bottom-start');
  readonly closeOnSelect = input(true);

  readonly isOpen = signal(false);
  readonly focusedIndex = signal(-1);

  private readonly elementRef = inject(ElementRef);

  readonly trigger = contentChild(DropdownTriggerDirective);
  readonly items = contentChildren(DropdownItemComponent);

  constructor() {
    // Connect trigger events
    effect(() => {
      const triggerRef = this.trigger();
      if (triggerRef) {
        triggerRef.toggleDropdown.subscribe(() => this.toggle());
        triggerRef.openDropdown.subscribe(() => this.open());
      }
    });

    // Handle item clicks
    effect(() => {
      const menuItems = this.items();
      menuItems.forEach(item => {
        item.clicked.subscribe(() => {
          if (this.closeOnSelect()) {
            this.close();
          }
        });
      });
    });

    // Sync focused state
    effect(() => {
      const index = this.focusedIndex();
      const menuItems = this.items();
      menuItems.forEach((item, i) => {
        item.focused.set(i === index);
      });
    });
  }

  protected menuPositionClass(): string {
    return `ui-dropdown__menu--${this.position()}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const focused = this.items()[this.focusedIndex()];
        if (focused && !focused.disabled()) {
          focused.clicked.emit();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.focusedIndex.set(-1);
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }

  private focusNext(): void {
    const menuItems = this.items();
    const current = this.focusedIndex();
    let next = current + 1;

    while (next < menuItems.length && menuItems[next].disabled()) {
      next++;
    }

    if (next < menuItems.length) {
      this.focusedIndex.set(next);
    }
  }

  private focusPrevious(): void {
    const menuItems = this.items();
    const current = this.focusedIndex();
    let prev = current <= 0 ? menuItems.length - 1 : current - 1;

    while (prev >= 0 && menuItems[prev].disabled()) {
      prev--;
    }

    if (prev >= 0) {
      this.focusedIndex.set(prev);
    }
  }
}
