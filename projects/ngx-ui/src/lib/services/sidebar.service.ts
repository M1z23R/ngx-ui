import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly MOBILE_BREAKPOINT = 768;

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile();
    const nowMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
    this.isMobile.set(nowMobile);

    // Close mobile sidebar when switching to desktop
    if (wasMobile && !nowMobile) {
      this.mobileOpen.set(false);
    }
  }

  toggle(): void {
    if (this.isMobile()) {
      this.mobileOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }

  expand(): void {
    this.collapsed.set(false);
  }

  collapse(): void {
    this.collapsed.set(true);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
