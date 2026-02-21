import {
  Component,
  Directive,
  ChangeDetectionStrategy,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

export interface TemplateVariable {
  key: string;
  value: string;
}

export type VariableState = 'resolved' | 'unset' | 'unknown';

/** Context provided to variable popover templates */
export interface VariablePopoverContext {
  /** The variable key (same as `key`) */
  $implicit: string;
  /** The variable key */
  key: string;
  /** Current value from the variables array, or empty string if unknown */
  value: string;
  /** State of the variable: 'resolved', 'unset', or 'unknown' */
  state: VariableState;
  /** Close the popover */
  close: () => void;
}

/** Directive to mark a custom variable popover template */
@Directive({
  selector: 'ng-template[uiVariablePopover]',
  standalone: true,
})
export class VariablePopoverDirective {}

/** Directive to mark suffix content (buttons, icons, etc.) */
@Directive({
  selector: '[uiTemplateInputSuffix]',
  standalone: true,
})
export class TemplateInputSuffixDirective {}

@Component({
  selector: 'ui-template-input',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './template-input.component.html',
  styleUrl: './template-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateInputComponent implements OnDestroy, AfterViewInit {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly id = input<string>('');

  /** The template string value. Two-way bindable. */
  readonly value = model.required<string>();

  /**
   * Known variables with their values. Two-way bindable.
   *
   * The component detects `{{key}}` patterns in the value and resolves state:
   * - Key found with a truthy value → 'resolved' (green)
   * - Key found with empty/falsy value → 'unset' (amber)
   * - Key NOT found in array → 'unknown' (red)
   */
  readonly variables = model.required<TemplateVariable[]>();

  /** Emits the variable key on hover, or null when hover ends. */
  readonly variableHover = output<string | null>();

  /** Custom popover template for variables. Receives VariablePopoverContext. */
  readonly popoverTemplate = contentChild(VariablePopoverDirective, { read: TemplateRef });

  /** Detect if suffix content is projected */
  readonly hasSuffix = contentChildren(TemplateInputSuffixDirective);

  protected readonly suffixRef = viewChild<ElementRef<HTMLDivElement>>('suffixEl');

  /** Computed padding-right based on suffix width */
  protected readonly suffixPadding = signal(0);

  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  private static nextId = 0;
  private readonly generatedId = `ui-template-input-${++TemplateInputComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);

  protected readonly mirrorRef = viewChild<ElementRef<HTMLDivElement>>('mirror');
  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  @ViewChild('popoverRef', { static: true }) popoverRef!: ElementRef<HTMLElement>;

  private readonly hostRef = inject(ElementRef);
  private positionCleanup: (() => void) | null = null;
  private currentSpanRect: DOMRect | null = null;
  private isPortaled = false;

  // Popover state
  protected readonly popoverVisible = signal(false);
  protected readonly openAbove = signal(true);
  protected readonly popoverText = signal('');
  protected readonly popoverVarKey = signal('');

  protected readonly popoverContext = computed<VariablePopoverContext>(() => {
    const key = this.popoverVarKey();
    const vars = this.variables();
    const entry = vars.find(v => v.key === key);
    return {
      $implicit: key,
      key,
      value: entry?.value ?? '',
      state: this.resolveVarState(key, vars),
      close: () => this.closePopover(),
    };
  });

  private hoveredVar: string | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly renderer: Renderer2) {
    this.injectStyles();
  }

  ngAfterViewInit(): void {
    this.setupSuffixObservers();
  }

  private setupSuffixObservers(): void {
    const suffixEl = this.suffixRef()?.nativeElement;
    if (!suffixEl) return;

    // Initial measurement - wait for layout to complete
    requestAnimationFrame(() => {
      this.updateSuffixPadding(suffixEl);
    });

    // Watch for size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSuffixPadding(suffixEl);
    });
    this.resizeObserver.observe(suffixEl);

    // Watch for content projection changes (children being added/removed)
    this.mutationObserver = new MutationObserver(() => {
      // Need RAF here too since DOM change doesn't mean layout is done
      requestAnimationFrame(() => {
        this.updateSuffixPadding(suffixEl);
      });
    });
    this.mutationObserver.observe(suffixEl, { childList: true, subtree: true });
  }

  private updateSuffixPadding(el: HTMLElement): void {
    // Only count width if there are actual children (not just whitespace/comments)
    const hasContent = el.children.length > 0;
    if (hasContent) {
      const width = el.offsetWidth;
      // Add small gap between content and suffix
      this.suffixPadding.set(width + 8);
    } else {
      this.suffixPadding.set(0);
    }
  }

  protected readonly highlightedHtml = computed(() => {
    const text = this.value();
    if (!text) return '\u200b';

    const vars = this.variables();
    const escaped = this.escapeHtml(text);

    // Use CSS classes instead of data-* attributes since Angular's
    // innerHTML sanitizer strips data attributes.
    return (
      escaped.replace(/\{\{([^}]+)\}\}/g, (_match, varKey: string) => {
        const state = this.resolveVarState(varKey, vars);
        return `<span class="ui-tmpl__var ui-tmpl__var--${state}">{{${this.escapeHtml(varKey)}}}</span>`;
      }) + '\u200b'
    );
  });

  protected syncScroll(): void {
    const inputEl = this.inputRef()?.nativeElement;
    const mirrorEl = this.mirrorRef()?.nativeElement;
    if (inputEl && mirrorEl) {
      mirrorEl.scrollLeft = inputEl.scrollLeft;
    }
  }

  protected onInput(): void {
    this.syncScroll();
  }

  protected onKeyDown(): void {
    requestAnimationFrame(() => this.syncScroll());
  }

  protected onMouseMove(event: MouseEvent): void {
    const mirrorEl = this.mirrorRef()?.nativeElement;
    if (!mirrorEl) {
      this.scheduleHide();
      return;
    }

    const spans = mirrorEl.querySelectorAll('.ui-tmpl__var') as NodeListOf<HTMLElement>;
    const { clientX, clientY } = event;

    for (const span of spans) {
      const rect = span.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        // Extract variable key from text content: "{{varKey}}" → "varKey"
        const varKey = (span.textContent || '').replace(/^\{\{|\}\}$/g, '');
        this.cancelHide();
        this.showPopover(varKey, rect);
        return;
      }
    }

    this.scheduleHide();
  }

  protected onContainerMouseLeave(): void {
    this.scheduleHide();
  }

  protected onPopoverMouseEnter(): void {
    this.cancelHide();
  }

  protected onPopoverMouseLeave(): void {
    this.scheduleHide();
  }

  private resolveVarState(varKey: string, vars: TemplateVariable[]): VariableState {
    const entry = vars.find(v => v.key === varKey);
    if (!entry) return 'unknown';
    return entry.value ? 'resolved' : 'unset';
  }

  private showPopover(varKey: string, spanRect: DOMRect): void {
    if (this.hoveredVar !== varKey) {
      this.hoveredVar = varKey;
      this.variableHover.emit(varKey);
    }

    const vars = this.variables();
    const entry = vars.find(v => v.key === varKey);
    this.popoverVarKey.set(varKey);
    this.popoverText.set(entry ? (entry.value || varKey) : varKey);
    this.currentSpanRect = spanRect;
    this.popoverVisible.set(true);

    if (!this.isPortaled) {
      this.portalPopover();
    } else {
      this.updatePopoverPosition();
    }
  }

  private closePopover(): void {
    this.cancelHide();
    this.popoverVisible.set(false);
    this.unportalPopover();
    if (this.hoveredVar !== null) {
      this.hoveredVar = null;
      this.variableHover.emit(null);
    }
  }

  private scheduleHide(): void {
    if (this.hideTimer) return;
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.closePopover();
    }, 200);
  }

  private cancelHide(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private static readonly STYLE_CONTENT = `
    .ui-tmpl__var {
      border-radius: 0.125rem;
    }
    .ui-tmpl__var--resolved {
      color: var(--ui-tmpl-resolved-color, var(--ui-success));
      background: var(--ui-tmpl-resolved-bg, color-mix(in srgb, var(--ui-success) 12%, transparent));
    }
    .ui-tmpl__var--unset {
      color: var(--ui-tmpl-unset-color, var(--ui-warning));
      background: var(--ui-tmpl-unset-bg, color-mix(in srgb, var(--ui-warning) 12%, transparent));
    }
    .ui-tmpl__var--unknown {
      color: var(--ui-tmpl-unknown-color, var(--ui-danger));
      background: var(--ui-tmpl-unknown-bg, color-mix(in srgb, var(--ui-danger) 12%, transparent));
    }
  `;

  private injectStyles(): void {
    const styleId = 'ui-tmpl-styles';
    let existing = document.getElementById(styleId);

    // Always replace to handle HMR / version upgrades
    if (existing) {
      existing.textContent = TemplateInputComponent.STYLE_CONTENT;
      return;
    }

    const style = this.renderer.createElement('style');
    this.renderer.setProperty(style, 'id', styleId);
    this.renderer.setProperty(style, 'textContent', TemplateInputComponent.STYLE_CONTENT);
    this.renderer.appendChild(document.head, style);
  }

  private portalPopover(): void {
    const el = this.popoverRef.nativeElement;
    document.body.appendChild(el);
    el.style.display = 'block';
    this.isPortaled = true;
    requestAnimationFrame(() => this.updatePopoverPosition());
    this.addPositionListeners();
  }

  private unportalPopover(): void {
    if (!this.isPortaled) return;
    const el = this.popoverRef.nativeElement;
    el.style.display = '';
    el.style.position = '';
    el.style.top = '';
    el.style.bottom = '';
    el.style.left = '';
    el.style.zIndex = '';
    this.hostRef.nativeElement.appendChild(el);
    this.isPortaled = false;
    this.currentSpanRect = null;
    this.removePositionListeners();
  }

  private updatePopoverPosition(): void {
    const el = this.popoverRef.nativeElement;
    const spanRect = this.getCurrentSpanRect() ?? this.currentSpanRect;
    if (!spanRect) return;

    this.currentSpanRect = spanRect;

    const gap = 6;
    const edgePadding = 8;
    const spaceAbove = spanRect.top;
    const spaceBelow = window.innerHeight - spanRect.bottom;
    const popoverHeight = el.offsetHeight;

    const above = spaceAbove >= popoverHeight + gap || spaceAbove >= spaceBelow;
    this.openAbove.set(above);

    el.style.position = 'fixed';
    el.style.zIndex = '10000';

    if (above) {
      el.style.top = '';
      el.style.bottom = `${window.innerHeight - spanRect.top + gap}px`;
    } else {
      el.style.top = `${spanRect.bottom + gap}px`;
      el.style.bottom = '';
    }

    // Horizontal: center on span, clamp to viewport
    const centerX = spanRect.left + spanRect.width / 2;
    const popoverWidth = el.offsetWidth;
    let left = centerX - popoverWidth / 2;
    left = Math.max(edgePadding, Math.min(left, window.innerWidth - popoverWidth - edgePadding));
    el.style.left = `${left}px`;
  }

  private getCurrentSpanRect(): DOMRect | null {
    const mirrorEl = this.mirrorRef()?.nativeElement;
    if (!mirrorEl) return null;

    const varKey = this.popoverVarKey();
    if (!varKey) return null;

    const spans = mirrorEl.querySelectorAll('.ui-tmpl__var') as NodeListOf<HTMLElement>;
    for (const span of spans) {
      const text = (span.textContent || '').replace(/^\{\{|\}\}$/g, '');
      if (text === varKey) {
        return span.getBoundingClientRect();
      }
    }
    return null;
  }

  private readonly onPositionUpdate = (): void => {
    if (this.isPortaled && this.popoverVisible()) {
      this.updatePopoverPosition();
    }
  };

  private addPositionListeners(): void {
    window.addEventListener('scroll', this.onPositionUpdate, true);
    window.addEventListener('resize', this.onPositionUpdate);
    this.positionCleanup = () => {
      window.removeEventListener('scroll', this.onPositionUpdate, true);
      window.removeEventListener('resize', this.onPositionUpdate);
    };
  }

  private removePositionListeners(): void {
    if (this.positionCleanup) {
      this.positionCleanup();
      this.positionCleanup = null;
    }
  }

  ngOnDestroy(): void {
    this.cancelHide();
    // Remove from body if still portaled
    if (this.isPortaled) {
      const el = this.popoverRef.nativeElement;
      el.remove();
      this.removePositionListeners();
      this.isPortaled = false;
    }
    // Clean up observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}
