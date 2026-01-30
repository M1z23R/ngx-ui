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

export type DatepickerView = 'day' | 'month' | 'year';
export type DatepickerSize = 'sm' | 'md' | 'lg';
export type DatepickerVariant = 'default' | 'outlined' | 'filled';
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

export interface CalendarMonth {
  month: number;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
}

export interface CalendarYear {
  year: number;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
  isInRange: boolean;
}

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent implements OnDestroy {
  // Inputs
  readonly variant = input<DatepickerVariant>('default');
  readonly size = input<DatepickerSize>('md');
  readonly placeholder = input('Select date');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly clearable = input(false);
  readonly range = input(false);
  readonly required = input(false);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly disabledDates = input<Date[] | ((date: Date) => boolean)>([]);
  readonly format = input('yyyy-MM-dd');
  readonly firstDayOfWeek = input<0 | 1>(1);
  readonly id = input('');

  // Two-way binding
  readonly value = model<Date | DateRange | null>(null);

  // Outputs
  readonly opened = output<void>();
  readonly closed = output<void>();

  // View children for dropdown portal
  @ViewChild('triggerRef', { static: true }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownRef', { static: true }) dropdownRef!: ElementRef<HTMLElement>;

  // Internal state
  readonly isOpen = signal(false);
  readonly currentView = signal<DatepickerView>('day');
  readonly viewDate = signal(new Date());
  readonly focusedDate = signal<Date | null>(null);
  readonly hoveredDate = signal<Date | null>(null);

  private readonly elementRef = inject(ElementRef);
  private positionCleanup: (() => void) | null = null;

  private static nextId = 0;
  private readonly generatedId = `ui-datepicker-${++DatepickerComponent.nextId}`;

  protected readonly inputId = computed(() => this.id() || this.generatedId);

  // Computed: display value
  protected readonly displayValue = computed(() => {
    const val = this.value();
    const fmt = this.format();

    if (!val) return '';

    if (this.range()) {
      const r = val as DateRange;
      if (!r.start && !r.end) return '';
      const startStr = r.start ? this.formatDate(r.start, fmt) : '';
      const endStr = r.end ? this.formatDate(r.end, fmt) : '';
      if (startStr && endStr) return `${startStr} — ${endStr}`;
      return startStr || endStr;
    }

    return this.formatDate(val as Date, fmt);
  });

  // Computed: trigger CSS classes
  protected readonly triggerClasses = computed(() => {
    return `ui-datepicker__trigger--${this.variant()} ui-datepicker__trigger--${this.size()}`;
  });

  // Computed: has value
  protected readonly hasValue = computed(() => {
    const val = this.value();
    if (!val) return false;
    if (this.range()) {
      const r = val as DateRange;
      return r.start !== null || r.end !== null;
    }
    return true;
  });

  // Computed: weekday headers
  protected readonly weekdayHeaders = computed(() => {
    const first = this.firstDayOfWeek();
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    const headers: string[] = [];
    // Use a known Sunday: Jan 4, 1970
    const base = new Date(1970, 0, 4 + first);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      headers.push(formatter.format(d));
    }
    return headers;
  });

  // Computed: month/year label for header
  protected readonly monthYearLabel = computed(() => {
    const vd = this.viewDate();
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    return formatter.format(vd);
  });

  // Computed: decade label for year view
  protected readonly decadeLabel = computed(() => {
    const year = this.viewDate().getFullYear();
    const startYear = year - (year % 10);
    return `${startYear} — ${startYear + 9}`;
  });

  // Computed: calendar grid (6 weeks x 7 days)
  protected readonly calendarGrid = computed(() => {
    const vd = this.viewDate();
    const year = vd.getFullYear();
    const month = vd.getMonth();
    const first = this.firstDayOfWeek();
    const today = new Date();
    const val = this.value();
    const isRange = this.range();
    const focused = this.focusedDate();
    const hovered = this.hoveredDate();

    // Find the start of the calendar grid
    const firstOfMonth = new Date(year, month, 1);
    let dayOfWeek = firstOfMonth.getDay() - first;
    if (dayOfWeek < 0) dayOfWeek += 7;
    const gridStart = new Date(year, month, 1 - dayOfWeek);

    // Determine selected date(s) and range
    let selectedDate: Date | null = null;
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (isRange && val) {
      const r = val as DateRange;
      rangeStart = r.start;
      rangeEnd = r.end;
      // If only start is set and we're hovering, use hovered as temporary end
      if (rangeStart && !rangeEnd && hovered) {
        if (hovered < rangeStart) {
          rangeEnd = rangeStart;
          rangeStart = hovered;
        } else {
          rangeEnd = hovered;
        }
      }
    } else if (val && !isRange) {
      selectedDate = val as Date;
    }

    const grid: CalendarDay[][] = [];
    const cursor = new Date(gridStart);

    for (let week = 0; week < 6; week++) {
      const row: CalendarDay[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(cursor);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = this.isSameDay(date, today);
        const isSelected = isRange
          ? (rangeStart ? this.isSameDay(date, rangeStart) : false) ||
            (rangeEnd ? this.isSameDay(date, rangeEnd) : false)
          : selectedDate ? this.isSameDay(date, selectedDate) : false;
        const isInRange = isRange && rangeStart && rangeEnd
          ? date > rangeStart && date < rangeEnd
          : false;
        const isRangeStart = isRange && rangeStart ? this.isSameDay(date, rangeStart) : false;
        const isRangeEnd = isRange && rangeEnd ? this.isSameDay(date, rangeEnd) : false;
        const isDisabled = this.isDateDisabled(date);
        const isFocused = focused ? this.isSameDay(date, focused) : false;

        row.push({
          date,
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          isInRange,
          isRangeStart,
          isRangeEnd,
          isDisabled,
          isFocused,
        });

        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(row);
    }

    return grid;
  });

  // Computed: month grid (4 rows x 3 columns)
  protected readonly monthGrid = computed(() => {
    const vd = this.viewDate();
    const year = vd.getFullYear();
    const today = new Date();
    const val = this.value();
    const isRange = this.range();
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short' });

    const grid: CalendarMonth[][] = [];
    let monthIdx = 0;

    for (let row = 0; row < 4; row++) {
      const rowArr: CalendarMonth[] = [];
      for (let col = 0; col < 3; col++) {
        const date = new Date(year, monthIdx, 1);
        let isSelected = false;

        if (isRange && val) {
          const r = val as DateRange;
          if (r.start && r.start.getFullYear() === year && r.start.getMonth() === monthIdx) isSelected = true;
          if (r.end && r.end.getFullYear() === year && r.end.getMonth() === monthIdx) isSelected = true;
        } else if (val && !isRange) {
          const d = val as Date;
          isSelected = d.getFullYear() === year && d.getMonth() === monthIdx;
        }

        const isDisabled = this.isMonthDisabled(year, monthIdx);
        const isCurrent = today.getFullYear() === year && today.getMonth() === monthIdx;

        rowArr.push({
          month: monthIdx,
          label: formatter.format(date),
          isSelected,
          isDisabled,
          isCurrent,
        });
        monthIdx++;
      }
      grid.push(rowArr);
    }

    return grid;
  });

  // Computed: year grid (4 rows x 3 columns)
  protected readonly yearGrid = computed(() => {
    const vd = this.viewDate();
    const year = vd.getFullYear();
    const startYear = year - (year % 10) - 1;
    const today = new Date();
    const val = this.value();
    const isRange = this.range();

    const grid: CalendarYear[][] = [];
    let yearIdx = startYear;

    for (let row = 0; row < 4; row++) {
      const rowArr: CalendarYear[] = [];
      for (let col = 0; col < 3; col++) {
        let isSelected = false;

        if (isRange && val) {
          const r = val as DateRange;
          if (r.start && r.start.getFullYear() === yearIdx) isSelected = true;
          if (r.end && r.end.getFullYear() === yearIdx) isSelected = true;
        } else if (val && !isRange) {
          isSelected = (val as Date).getFullYear() === yearIdx;
        }

        const isDisabled = this.isYearDisabled(yearIdx);
        const isCurrent = today.getFullYear() === yearIdx;
        const isInRange = yearIdx >= startYear + 1 && yearIdx <= startYear + 10;

        rowArr.push({
          year: yearIdx,
          isSelected,
          isDisabled,
          isCurrent,
          isInRange,
        });
        yearIdx++;
      }
      grid.push(rowArr);
    }

    return grid;
  });

  // Computed: can navigate prev/next
  protected readonly canNavigatePrev = computed(() => {
    const min = this.minDate();
    if (!min) return true;
    const vd = this.viewDate();
    const view = this.currentView();

    if (view === 'day') {
      return vd.getFullYear() > min.getFullYear() ||
        (vd.getFullYear() === min.getFullYear() && vd.getMonth() > min.getMonth());
    }
    if (view === 'month') {
      return vd.getFullYear() > min.getFullYear();
    }
    // year view
    const startYear = vd.getFullYear() - (vd.getFullYear() % 10);
    return startYear > min.getFullYear();
  });

  protected readonly canNavigateNext = computed(() => {
    const max = this.maxDate();
    if (!max) return true;
    const vd = this.viewDate();
    const view = this.currentView();

    if (view === 'day') {
      return vd.getFullYear() < max.getFullYear() ||
        (vd.getFullYear() === max.getFullYear() && vd.getMonth() < max.getMonth());
    }
    if (view === 'month') {
      return vd.getFullYear() < max.getFullYear();
    }
    // year view
    const startYear = vd.getFullYear() - (vd.getFullYear() % 10);
    return startYear + 9 < max.getFullYear();
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
    this.currentView.set('day');
    this.focusedDate.set(null);
    this.hoveredDate.set(null);

    // Set viewDate to current value or today
    const val = this.value();
    if (val) {
      if (this.range()) {
        const r = val as DateRange;
        if (r.start) {
          this.viewDate.set(new Date(r.start.getFullYear(), r.start.getMonth(), 1));
        }
      } else {
        const d = val as Date;
        this.viewDate.set(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    } else {
      const today = new Date();
      this.viewDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    this.opened.emit();
    this.portalDropdown();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.unportalDropdown();
    this.isOpen.set(false);
    this.focusedDate.set(null);
    this.hoveredDate.set(null);
    this.closed.emit();
  }

  selectDay(day: CalendarDay): void {
    if (day.isDisabled) return;

    if (this.range()) {
      const current = this.value() as DateRange | null;
      if (!current || !current.start || current.end) {
        // Start new range
        this.value.set({ start: day.date, end: null });
      } else {
        // Complete the range
        let start = current.start;
        let end = day.date;
        if (end < start) {
          [start, end] = [end, start];
        }
        this.value.set({ start, end });
        this.close();
      }
    } else {
      this.value.set(day.date);
      this.close();
    }
  }

  selectMonth(month: CalendarMonth): void {
    if (month.isDisabled) return;
    const vd = this.viewDate();
    this.viewDate.set(new Date(vd.getFullYear(), month.month, 1));
    this.currentView.set('day');
  }

  selectYear(year: CalendarYear): void {
    if (year.isDisabled) return;
    const vd = this.viewDate();
    this.viewDate.set(new Date(year.year, vd.getMonth(), 1));
    this.currentView.set('month');
  }

  navigatePrev(): void {
    if (!this.canNavigatePrev()) return;
    const vd = this.viewDate();
    const view = this.currentView();

    if (view === 'day') {
      this.viewDate.set(new Date(vd.getFullYear(), vd.getMonth() - 1, 1));
    } else if (view === 'month') {
      this.viewDate.set(new Date(vd.getFullYear() - 1, vd.getMonth(), 1));
    } else {
      this.viewDate.set(new Date(vd.getFullYear() - 10, vd.getMonth(), 1));
    }
  }

  navigateNext(): void {
    if (!this.canNavigateNext()) return;
    const vd = this.viewDate();
    const view = this.currentView();

    if (view === 'day') {
      this.viewDate.set(new Date(vd.getFullYear(), vd.getMonth() + 1, 1));
    } else if (view === 'month') {
      this.viewDate.set(new Date(vd.getFullYear() + 1, vd.getMonth(), 1));
    } else {
      this.viewDate.set(new Date(vd.getFullYear() + 10, vd.getMonth(), 1));
    }
  }

  switchToMonthView(): void {
    this.currentView.set('month');
  }

  switchToYearView(): void {
    this.currentView.set('year');
  }

  goToToday(): void {
    const today = new Date();
    this.viewDate.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.currentView.set('day');
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    if (this.range()) {
      this.value.set({ start: null, end: null });
    } else {
      this.value.set(null);
    }
  }

  onDayHover(day: CalendarDay): void {
    if (this.range()) {
      const current = this.value() as DateRange | null;
      if (current && current.start && !current.end) {
        this.hoveredDate.set(day.date);
      }
    }
  }

  onDayHoverLeave(): void {
    this.hoveredDate.set(null);
  }

  protected handleTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          const focused = this.focusedDate();
          if (focused && this.currentView() === 'day') {
            const day = this.findDayInGrid(focused);
            if (day && !day.isDisabled) {
              this.selectDay(day);
            }
          }
        } else {
          this.open();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else if (this.currentView() === 'day') {
          this.moveFocus(7);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.currentView() === 'day') {
          this.moveFocus(-7);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.currentView() === 'day') {
          this.moveFocus(-1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.currentView() === 'day') {
          this.moveFocus(1);
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

  // Date formatting
  private formatDate(date: Date, format: string): string {
    const yyyy = date.getFullYear().toString();
    const yy = yyyy.slice(-2);
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const M = (date.getMonth() + 1).toString();
    const dd = date.getDate().toString().padStart(2, '0');
    const d = date.getDate().toString();

    return format
      .replace('yyyy', yyyy)
      .replace('yy', yy)
      .replace('MM', MM)
      .replace('M', M)
      .replace('dd', dd)
      .replace('d', d);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private isDateDisabled(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();

    if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
    if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;

    const disabled = this.disabledDates();
    if (typeof disabled === 'function') {
      return disabled(date);
    }
    if (Array.isArray(disabled)) {
      return disabled.some((d) => this.isSameDay(d, date));
    }
    return false;
  }

  private isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDate();
    const max = this.maxDate();

    if (min) {
      if (year < min.getFullYear()) return true;
      if (year === min.getFullYear() && month < min.getMonth()) return true;
    }
    if (max) {
      if (year > max.getFullYear()) return true;
      if (year === max.getFullYear() && month > max.getMonth()) return true;
    }
    return false;
  }

  private isYearDisabled(year: number): boolean {
    const min = this.minDate();
    const max = this.maxDate();

    if (min && year < min.getFullYear()) return true;
    if (max && year > max.getFullYear()) return true;
    return false;
  }

  private moveFocus(days: number): void {
    let current = this.focusedDate();
    if (!current) {
      // Start from current value or today
      const val = this.value();
      if (val && !this.range()) {
        current = val as Date;
      } else if (val && this.range()) {
        const r = val as DateRange;
        current = r.start || new Date();
      } else {
        current = new Date();
      }
    }

    const next = new Date(current);
    next.setDate(next.getDate() + days);

    // If moving outside the current month, navigate
    const vd = this.viewDate();
    if (next.getMonth() !== vd.getMonth() || next.getFullYear() !== vd.getFullYear()) {
      this.viewDate.set(new Date(next.getFullYear(), next.getMonth(), 1));
    }

    this.focusedDate.set(next);
  }

  private findDayInGrid(date: Date): CalendarDay | null {
    for (const week of this.calendarGrid()) {
      for (const day of week) {
        if (this.isSameDay(day.date, date)) {
          return day;
        }
      }
    }
    return null;
  }

  // Portal pattern (matches SelectComponent)
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
      const wrapper = this.elementRef.nativeElement.querySelector('.ui-datepicker-wrapper');
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
