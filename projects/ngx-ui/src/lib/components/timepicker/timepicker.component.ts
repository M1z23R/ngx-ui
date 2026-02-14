import {
  Component,
  input,
  model,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';

export type TimepickerSize = 'sm' | 'md' | 'lg';
export type TimepickerVariant = 'default' | 'outlined' | 'filled';
export type TimeFormat = '12h' | '24h';

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

@Component({
  selector: 'ui-timepicker',
  standalone: true,
  templateUrl: './timepicker.component.html',
  styleUrl: './timepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerComponent implements OnDestroy {
  // Inputs
  readonly variant = input<TimepickerVariant>('default');
  readonly size = input<TimepickerSize>('md');
  readonly placeholder = input('Select time');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly clearable = input(false);
  readonly required = input(false);
  readonly showSeconds = input(false);
  readonly format = input<TimeFormat>('24h');
  readonly minuteStep = input(1);
  readonly secondStep = input(1);
  readonly minTime = input<TimeValue | null>(null);
  readonly maxTime = input<TimeValue | null>(null);
  readonly id = input('');

  // Two-way binding
  readonly value = model<TimeValue | null>(null);

  // Outputs
  readonly opened = output<void>();
  readonly closed = output<void>();

  // View children for dropdown portal
  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownRef', { static: true }) dropdownRef!: ElementRef<HTMLElement>;

  // Internal state
  readonly isOpen = signal(false);
  readonly selectedHour = signal(0);
  readonly selectedMinute = signal(0);
  readonly selectedSecond = signal(0);
  readonly selectedPeriod = signal<'AM' | 'PM'>('AM');

  private readonly elementRef = inject(ElementRef);
  private positionCleanup: (() => void) | null = null;

  private static nextId = 0;
  private readonly generatedId = `ui-timepicker-${++TimepickerComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);

  // Computed: hours list
  protected readonly hoursList = computed(() => {
    const is12h = this.format() === '12h';
    const hours: number[] = [];
    const max = is12h ? 12 : 24;
    const start = is12h ? 1 : 0;

    for (let i = start; i <= (is12h ? 12 : 23); i++) {
      hours.push(i);
    }
    return hours;
  });

  // Computed: minutes list
  protected readonly minutesList = computed(() => {
    const step = this.minuteStep();
    const minutes: number[] = [];
    for (let i = 0; i < 60; i += step) {
      minutes.push(i);
    }
    return minutes;
  });

  // Computed: seconds list
  protected readonly secondsList = computed(() => {
    const step = this.secondStep();
    const seconds: number[] = [];
    for (let i = 0; i < 60; i += step) {
      seconds.push(i);
    }
    return seconds;
  });

  // Computed: display value
  protected readonly displayValue = computed(() => {
    const val = this.value();
    if (!val) return '';

    const is12h = this.format() === '12h';
    let hours = val.hours;
    let period = '';

    if (is12h) {
      period = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }

    const hStr = hours.toString().padStart(2, '0');
    const mStr = val.minutes.toString().padStart(2, '0');

    if (this.showSeconds() && val.seconds !== undefined) {
      const sStr = val.seconds.toString().padStart(2, '0');
      return `${hStr}:${mStr}:${sStr}${period}`;
    }

    return `${hStr}:${mStr}${period}`;
  });

  // Computed: trigger CSS classes
  protected readonly triggerClasses = computed(() => {
    return `ui-timepicker__trigger--${this.variant()} ui-timepicker__trigger--${this.size()}`;
  });

  // Computed: has value
  protected readonly hasValue = computed(() => {
    return this.value() !== null;
  });

  ngOnDestroy(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (dropdown?.parentElement === document.body) {
      document.body.removeChild(dropdown);
    }
    this.removePositionListeners();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (
      !this.elementRef.nativeElement.contains(target) &&
      !this.dropdownRef?.nativeElement?.contains(target)
    ) {
      this.close();
    }
  }

  toggle(): void {
    if (this.disabled() || this.readonly()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled() || this.readonly() || this.isOpen()) return;
    this.isOpen.set(true);

    // Initialize selection from current value
    const val = this.value();
    if (val) {
      const is12h = this.format() === '12h';
      if (is12h) {
        const period = val.hours >= 12 ? 'PM' : 'AM';
        let hours = val.hours % 12;
        if (hours === 0) hours = 12;
        this.selectedHour.set(hours);
        this.selectedPeriod.set(period);
      } else {
        this.selectedHour.set(val.hours);
      }
      this.selectedMinute.set(val.minutes);
      this.selectedSecond.set(val.seconds ?? 0);
    } else {
      const now = new Date();
      const is12h = this.format() === '12h';
      if (is12h) {
        const hours = now.getHours();
        this.selectedPeriod.set(hours >= 12 ? 'PM' : 'AM');
        let h = hours % 12;
        if (h === 0) h = 12;
        this.selectedHour.set(h);
      } else {
        this.selectedHour.set(now.getHours());
      }
      this.selectedMinute.set(now.getMinutes());
      this.selectedSecond.set(now.getSeconds());
    }

    this.opened.emit();
    this.portalDropdown();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.unportalDropdown();
    this.isOpen.set(false);
    this.closed.emit();
  }

  selectHour(hour: number): void {
    this.selectedHour.set(hour);
    this.updateValue();
  }

  selectMinute(minute: number): void {
    this.selectedMinute.set(minute);
    this.updateValue();
  }

  selectSecond(second: number): void {
    this.selectedSecond.set(second);
    this.updateValue();
  }

  selectPeriod(period: 'AM' | 'PM'): void {
    this.selectedPeriod.set(period);
    this.updateValue();
  }

  setNow(): void {
    const now = new Date();
    const is12h = this.format() === '12h';
    const hours = now.getHours();

    if (is12h) {
      this.selectedPeriod.set(hours >= 12 ? 'PM' : 'AM');
      let h = hours % 12;
      if (h === 0) h = 12;
      this.selectedHour.set(h);
    } else {
      this.selectedHour.set(hours);
    }
    this.selectedMinute.set(now.getMinutes());
    this.selectedSecond.set(now.getSeconds());
    this.updateValue();
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
  }

  protected isHourDisabled(hour: number): boolean {
    return false; // Can be extended for min/max time validation
  }

  protected isMinuteDisabled(minute: number): boolean {
    return false; // Can be extended for min/max time validation
  }

  protected isSecondDisabled(second: number): boolean {
    return false; // Can be extended for min/max time validation
  }

  protected handleTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
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

  protected formatNumber(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private updateValue(): void {
    const is12h = this.format() === '12h';
    let hours = this.selectedHour();

    if (is12h) {
      if (this.selectedPeriod() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (this.selectedPeriod() === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    const newValue: TimeValue = {
      hours,
      minutes: this.selectedMinute(),
    };

    if (this.showSeconds()) {
      newValue.seconds = this.selectedSecond();
    }

    this.value.set(newValue);
  }

  // Portal pattern
  private portalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;

    dropdown.style.display = 'block';
    document.body.appendChild(dropdown);
    this.updateDropdownPosition();
    this.addPositionListeners();
  }

  private unportalDropdown(): void {
    const dropdown = this.dropdownRef?.nativeElement;
    if (!dropdown) return;

    if (dropdown.parentElement === document.body) {
      const wrapper = this.elementRef.nativeElement.querySelector('.ui-timepicker-wrapper');
      if (wrapper) {
        wrapper.appendChild(dropdown);
      }
    }

    dropdown.style.display = '';
    dropdown.style.position = '';
    dropdown.style.top = '';
    dropdown.style.left = '';
    dropdown.style.bottom = '';
    dropdown.style.minWidth = '';
    dropdown.style.zIndex = '';
    dropdown.style.margin = '';

    this.removePositionListeners();
  }

  private updateDropdownPosition(): void {
    const trigger = this.triggerRef?.nativeElement;
    const dropdown = this.dropdownRef?.nativeElement;
    if (!trigger || !dropdown) return;

    const triggerRect = trigger.getBoundingClientRect();
    const dropdownHeight = dropdown.scrollHeight;
    const gap = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const openAbove = spaceBelow < dropdownHeight + gap && spaceAbove > spaceBelow;

    dropdown.style.position = 'fixed';
    dropdown.style.minWidth = `${triggerRect.width}px`;
    dropdown.style.left = `${triggerRect.left}px`;
    dropdown.style.zIndex = '99999';
    dropdown.style.margin = '0';

    if (openAbove) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = `${window.innerHeight - triggerRect.top + gap}px`;
    } else {
      dropdown.style.top = `${triggerRect.bottom + gap}px`;
      dropdown.style.bottom = 'auto';
    }
  }

  private addPositionListeners(): void {
    const update = () => {
      if (this.isOpen()) {
        this.updateDropdownPosition();
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
