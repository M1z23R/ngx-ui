import {
  Component,
  input,
  signal,
  computed,
  contentChildren,
  TemplateRef,
  ChangeDetectionStrategy,
  Directive,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CellValuePipe } from './cell-value.pipe';

export interface TableColumn<T = unknown> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

@Directive({
  selector: '[uiCellTemplate]',
  standalone: true,
})
export class CellTemplateDirective {
  readonly column = input.required<string>({ alias: 'uiCellTemplate' });

  constructor(public templateRef: TemplateRef<unknown>) {}
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [NgTemplateOutlet, CellValuePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends object> {
  readonly data = input<T[]>([]);
  readonly columns = input<TableColumn<T>[]>([]);
  readonly trackByFn = input<(item: T) => unknown>((item: T) => item);

  readonly cellTemplates = contentChildren(CellTemplateDirective);

  readonly sortState = signal<SortState>({ column: null, direction: null });

  protected readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const directive of this.cellTemplates()) {
      map.set(directive.column(), directive.templateRef);
    }
    return map;
  });

  readonly sortedData = computed(() => {
    const items = this.data();
    const { column, direction } = this.sortState();

    if (!column || !direction) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aVal = this.getValueInternal(a, column);
      const bVal = this.getValueInternal(b, column);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  protected handleHeaderClick(col: TableColumn<T>): void {
    if (col.sortable) {
      this.toggleSort(String(col.key));
    }
  }

  toggleSort(column: string): void {
    this.sortState.update(state => {
      if (state.column !== column) {
        return { column, direction: 'asc' };
      }
      if (state.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return { column: null, direction: null };
    });
  }

  private getValueInternal(row: T, key: string): unknown {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      if (value == null) return undefined;
      value = (value as Record<string, unknown>)[k];
    }
    return value;
  }

}
