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
  imports: [NgTemplateOutlet],
  template: `
    <div class="ui-table-container">
      <table class="ui-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [style.width]="col.width"
                [class.ui-table__th--sortable]="col.sortable"
                (click)="handleHeaderClick(col)"
              >
                <span class="ui-table__th-content">
                  {{ col.header }}
                  @if (col.sortable) {
                    <span class="ui-table__sort-icon">
                      @if (sortState().column === col.key) {
                        @if (sortState().direction === 'asc') {
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 14l5-5 5 5H7z"/>
                          </svg>
                        } @else if (sortState().direction === 'desc') {
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5H7z"/>
                          </svg>
                        }
                      } @else {
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                          <path d="M7 10l5-5 5 5H7zm0 4l5 5 5-5H7z"/>
                        </svg>
                      }
                    </span>
                  }
                </span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of sortedData(); track trackByFn()(row); let i = $index) {
            <tr>
              @for (col of columns(); track col.key) {
                <td>
                  @if (getCellTemplate(getKeyAsString(col.key)); as template) {
                    <ng-container *ngTemplateOutlet="template; context: { $implicit: row, row: row, index: i, value: getValueInternal(row, getKeyAsString(col.key)) }" />
                  } @else {
                    {{ getValueInternal(row, getKeyAsString(col.key)) }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length" class="ui-table__empty">
                <ng-content select="[slot=empty]">No data available</ng-content>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .ui-table-container {
      overflow-x: auto;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
    }

    .ui-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--ui-font-sm);
    }

    thead {
      background-color: var(--ui-bg-secondary);
    }

    th {
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      text-align: left;
      font-weight: 600;
      color: var(--ui-text);
      border-bottom: 1px solid var(--ui-border);
      white-space: nowrap;
    }

    .ui-table__th--sortable {
      cursor: pointer;
      user-select: none;
    }

    .ui-table__th--sortable:hover {
      background-color: var(--ui-bg-tertiary);
    }

    .ui-table__th-content {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-spacing-xs);
    }

    .ui-table__sort-icon {
      display: inline-flex;
      align-items: center;
    }

    td {
      padding: var(--ui-spacing-sm) var(--ui-spacing-md);
      color: var(--ui-text);
      border-bottom: 1px solid var(--ui-border);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background-color: var(--ui-bg-secondary);
    }

    .ui-table__empty {
      text-align: center;
      padding: var(--ui-spacing-xl);
      color: var(--ui-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends object> {
  readonly data = input<T[]>([]);
  readonly columns = input<TableColumn<T>[]>([]);
  readonly trackByFn = input<(item: T) => unknown>((item: T) => item);

  readonly cellTemplates = contentChildren(CellTemplateDirective);

  readonly sortState = signal<SortState>({ column: null, direction: null });

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
      this.toggleSort(this.getKeyAsString(col.key));
    }
  }

  protected getKeyAsString(key: keyof T | string): string {
    return String(key);
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

  protected getValueInternal(row: T, key: string): unknown {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      if (value == null) return undefined;
      value = (value as Record<string, unknown>)[k];
    }
    return value;
  }

  protected getCellTemplate(column: string): TemplateRef<unknown> | null {
    const templates = this.cellTemplates();
    const directive = templates.find(t => t.column() === column);
    return directive?.templateRef ?? null;
  }
}
