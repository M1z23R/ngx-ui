import { Component, input, model, computed, ChangeDetectionStrategy } from '@angular/core';

export type PaginationSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly maxPages = input(5);
  readonly showFirstLast = input(true);
  readonly size = input<PaginationSize>('md');

  readonly page = model(1);

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  });

  protected readonly paginationClasses = computed(() => {
    return `ui-pagination--${this.size()}`;
  });

  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const max = this.maxPages();

    const pages: { type: 'page' | 'ellipsis'; value: number }[] = [];

    if (total <= max) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push({ type: 'page', value: i });
      }
    } else {
      // Calculate range around current page
      const sidePages = Math.floor((max - 3) / 2); // Reserve slots for first, last, and one ellipsis
      let startPage = Math.max(2, current - sidePages);
      let endPage = Math.min(total - 1, current + sidePages);

      // Adjust if we're near the start
      if (current <= sidePages + 2) {
        startPage = 2;
        endPage = max - 2;
      }

      // Adjust if we're near the end
      if (current >= total - sidePages - 1) {
        startPage = total - max + 3;
        endPage = total - 1;
      }

      // Always show first page
      pages.push({ type: 'page', value: 1 });

      // Show ellipsis if there's a gap after first page
      if (startPage > 2) {
        pages.push({ type: 'ellipsis', value: -1 });
      }

      // Show middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push({ type: 'page', value: i });
      }

      // Show ellipsis if there's a gap before last page
      if (endPage < total - 1) {
        pages.push({ type: 'ellipsis', value: -2 });
      }

      // Always show last page
      pages.push({ type: 'page', value: total });
    }

    return pages;
  });

  protected goToPage(pageNum: number): void {
    const total = this.totalPages();
    const newPage = Math.max(1, Math.min(total, pageNum));

    if (newPage !== this.page()) {
      this.page.set(newPage);
    }
  }
}
