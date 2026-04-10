import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PaginationComponent {
  @Input() currentPage: number;
  @Input() totalPagesCount: number;
  @Input() componentPagesCount: number;
  @Input() routerLinkFn?: (page: number) => string[];
  @Output() pageChange = new EventEmitter<number>();

  get visiblePages(): (number | null)[] {
    const n = this.componentPagesCount;
    const total = this.totalPagesCount;

    if (total <= 1) return [];

    const lastPage = total - 1;

    // All pages fit without truncation
    if (total <= n) {
      return Array.from({ length: total }, (_, i) => i);
    }

    // Window size when both ellipses are shown (layout 4)
    // n items = 1 (first) + 1 (ellipsis) + w (window) + 1 (ellipsis) + 1 (last)
    const w = n - 4;

    if (w <= 0) {
      // n <= 4: no room for a floating window, split into left/right layouts only
      if (this.currentPage * 2 <= lastPage) {
        // Layout 2: first contiguous run + ellipsis + last
        const result: (number | null)[] = [];

        for (let i = 0; i <= Math.max(0, n - 3); i++) {
          result.push(i);
        }

        result.push(null, lastPage);

        return result;
      } else {
        // Layout 3: first + ellipsis + last contiguous run
        const result: (number | null)[] = [0, null];

        for (let i = Math.max(1, lastPage - (n - 3)); i <= lastPage; i++) {
          result.push(i);
        }

        return result;
      }
    }

    const half = Math.floor(w / 2);

    // Layout 2: currentPage is close enough to the start that no left ellipsis is needed
    // The floating window would start at currentPage - half; no left ellipsis when that's <= 1
    if (this.currentPage <= 1 + half) {
      // Show pages 0 through n-3, then ellipsis, then last
      // Count: (n-2) pages + 1 ellipsis + 1 last = n
      const result: (number | null)[] = [];

      for (let i = 0; i <= n - 3; i++) {
        result.push(i);
      }

      result.push(null, lastPage);

      return result;
    }

    // Layout 3: currentPage is close enough to the end that no right ellipsis is needed
    // The floating window would end at currentPage - half + w - 1; no right ellipsis when that's >= lastPage - 1
    if (this.currentPage >= lastPage - w + half) {
      // Show first, then ellipsis, then pages (lastPage - (n-3)) through last
      // Count: 1 first + 1 ellipsis + (n-2) pages = n
      const result: (number | null)[] = [0, null];

      for (let i = lastPage - (n - 3); i <= lastPage; i++) {
        result.push(i);
      }

      return result;
    }

    // Layout 4: currentPage is in the middle — both ellipses shown
    // Count: 1 first + 1 ellipsis + w window + 1 ellipsis + 1 last = n
    const windowStart = this.currentPage - half;
    const result: (number | null)[] = [0, null];

    for (let i = windowStart; i < windowStart + w; i++) {
      result.push(i);
    }

    result.push(null, lastPage);

    return result;
  }
}
