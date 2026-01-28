import { Directive, ElementRef, input, OnDestroy, Renderer2, signal, effect, HostListener } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Directive({
  selector: '[uiTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  readonly uiTooltip = input.required<string>();
  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly tooltipDelay = input(200);
  readonly tooltipDisabled = input(false);

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly isVisible = signal(false);

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {
    effect(() => {
      if (this.tooltipElement && this.isVisible()) {
        this.renderer.setProperty(this.tooltipElement.querySelector('.ui-tooltip__content'), 'textContent', this.uiTooltip());
      }
    });
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipDisabled()) return;
    this.showTimeout = setTimeout(() => this.show(), this.tooltipDelay());
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.tooltipDisabled()) return;
    this.show();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hide();
  }

  private show(): void {
    if (this.tooltipDisabled() || this.isVisible()) return;

    this.createTooltip();
    this.positionTooltip();
    this.isVisible.set(true);

    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'ui-tooltip--visible');
      }
    });
  }

  private hide(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'ui-tooltip--visible');
      setTimeout(() => this.destroyTooltip(), 150);
    }

    this.isVisible.set(false);
  }

  private createTooltip(): void {
    if (this.tooltipElement) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'ui-tooltip');
    this.renderer.addClass(this.tooltipElement, `ui-tooltip--${this.tooltipPosition()}`);

    const content = this.renderer.createElement('span');
    this.renderer.addClass(content, 'ui-tooltip__content');
    this.renderer.setProperty(content, 'textContent', this.uiTooltip());
    this.renderer.appendChild(this.tooltipElement, content);

    const arrow = this.renderer.createElement('span');
    this.renderer.addClass(arrow, 'ui-tooltip__arrow');
    this.renderer.appendChild(this.tooltipElement, arrow);

    this.renderer.appendChild(document.body, this.tooltipElement);
    this.injectStyles();
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition()) {
      case 'top':
        top = hostRect.top + scrollY - tooltipRect.height - 8;
        left = hostRect.left + scrollX + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + scrollY + 8;
        left = hostRect.left + scrollX + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + scrollY + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = hostRect.top + scrollY + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + scrollX + 8;
        break;
    }

    // Viewport boundary checks
    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    top = Math.max(padding, top);

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private destroyTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  private injectStyles(): void {
    const styleId = 'ui-tooltip-styles';
    if (document.getElementById(styleId)) return;

    const style = this.renderer.createElement('style');
    this.renderer.setProperty(style, 'id', styleId);
    this.renderer.setProperty(style, 'textContent', `
      .ui-tooltip {
        position: absolute;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transform: scale(0.95);
        transition: opacity 150ms, transform 150ms;
      }

      .ui-tooltip--visible {
        opacity: 1;
        transform: scale(1);
      }

      .ui-tooltip__content {
        display: block;
        padding: 0.375rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
        background: #1f2937;
        border-radius: 0.375rem;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .ui-tooltip__arrow {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #1f2937;
        transform: rotate(45deg);
      }

      .ui-tooltip--top .ui-tooltip__arrow {
        bottom: -4px;
        left: 50%;
        margin-left: -4px;
      }

      .ui-tooltip--bottom .ui-tooltip__arrow {
        top: -4px;
        left: 50%;
        margin-left: -4px;
      }

      .ui-tooltip--left .ui-tooltip__arrow {
        right: -4px;
        top: 50%;
        margin-top: -4px;
      }

      .ui-tooltip--right .ui-tooltip__arrow {
        left: -4px;
        top: 50%;
        margin-top: -4px;
      }
    `);
    this.renderer.appendChild(document.head, style);
  }

  ngOnDestroy(): void {
    this.hide();
    this.destroyTooltip();
  }
}
