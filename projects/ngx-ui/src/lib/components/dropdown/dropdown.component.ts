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
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DropdownTriggerDirective } from './dropdown-trigger.directive';
import { DropdownItemComponent } from './dropdown-item.component';

export type DropdownPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type DropdownAlign = 'start' | 'end';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnDestroy {
  readonly position = input<DropdownPosition>('bottom-start');
  readonly closeOnSelect = input(true);
  readonly matchTriggerWidth = input(false);

  readonly isOpen = signal(false);
  readonly focusedIndex = signal(-1);

  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('menuRef', { static: true }) menuRef!: ElementRef<HTMLElement>;

  private readonly elementRef = inject(ElementRef);
  private positionCleanup: (() => void) | null = null;
  private contextMenuPosition: { x: number; y: number } | null = null;

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
      menuItems.forEach((item) => {
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

  ngOnDestroy(): void {
    const menu = this.menuRef?.nativeElement;
    if (menu?.parentElement === document.body) {
      document.body.removeChild(menu);
    }
    this.removePositionListeners();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.menuRef?.nativeElement?.contains(target)
    ) {
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
    this.contextMenuPosition = null;
    this.isOpen.set(true);
    this.focusedIndex.set(-1);
    this.portalMenu();
  }

  /** Opens the dropdown at specific coordinates (for context menus) */
  openAt(x: number, y: number): void {
    if (this.isOpen()) {
      this.close();
    }
    this.contextMenuPosition = { x, y };
    this.isOpen.set(true);
    this.focusedIndex.set(-1);
    this.portalMenu();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.unportalMenu();
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.contextMenuPosition = null;
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

  private portalMenu(): void {
    const menu = this.menuRef?.nativeElement;
    if (!menu) return;

    menu.style.display = 'block';
    document.body.appendChild(menu);
    this.updateMenuPosition();
    this.addPositionListeners();
  }

  private unportalMenu(): void {
    const menu = this.menuRef?.nativeElement;
    if (!menu) return;

    if (menu.parentElement === document.body) {
      const wrapper = this.elementRef.nativeElement.querySelector('.ui-dropdown');
      if (wrapper) {
        wrapper.appendChild(menu);
      }
    }

    menu.style.display = '';
    menu.style.position = '';
    menu.style.top = '';
    menu.style.left = '';
    menu.style.right = '';
    menu.style.bottom = '';
    menu.style.width = '';
    menu.style.zIndex = '';
    menu.style.margin = '';

    this.removePositionListeners();
  }

  private updateMenuPosition(): void {
    const menu = this.menuRef?.nativeElement;
    if (!menu) return;

    menu.style.position = 'fixed';
    menu.style.zIndex = '99999';
    menu.style.margin = '0';

    // Context menu mode: position at cursor
    if (this.contextMenuPosition) {
      const { x, y } = this.contextMenuPosition;
      const menuWidth = menu.scrollWidth;
      const menuHeight = menu.scrollHeight;

      // Adjust if menu would go off-screen
      const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 4 : x;
      const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 4 : y;

      menu.style.left = `${Math.max(4, adjustedX)}px`;
      menu.style.top = `${Math.max(4, adjustedY)}px`;
      menu.style.right = 'auto';
      menu.style.bottom = 'auto';
      return;
    }

    // Standard dropdown mode: position relative to trigger
    const trigger = this.triggerRef?.nativeElement;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = menu.scrollHeight;
    const gap = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const preferTop = this.position().startsWith('top');
    const openAbove = preferTop
      ? spaceAbove >= menuHeight + gap || spaceAbove > spaceBelow
      : spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;
    const alignEnd = this.position().endsWith('end');

    if (openAbove) {
      menu.style.top = 'auto';
      menu.style.bottom = `${window.innerHeight - triggerRect.top + gap}px`;
    } else {
      menu.style.top = `${triggerRect.bottom + gap}px`;
      menu.style.bottom = 'auto';
    }

    if (alignEnd) {
      menu.style.left = 'auto';
      menu.style.right = `${window.innerWidth - triggerRect.right}px`;
    } else {
      menu.style.left = `${triggerRect.left}px`;
      menu.style.right = 'auto';
    }

    if (this.matchTriggerWidth()) {
      menu.style.width = `${triggerRect.width}px`;
    }
  }

  private addPositionListeners(): void {
    const update = () => {
      if (this.isOpen()) {
        this.updateMenuPosition();
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    this.positionCleanup = () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }

  private removePositionListeners(): void {
    this.positionCleanup?.();
    this.positionCleanup = null;
  }
}
