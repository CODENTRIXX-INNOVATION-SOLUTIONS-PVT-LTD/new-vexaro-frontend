import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() limit = 20;
  @Input() total = 0;
  @Input() disabled = false;
  @Input() itemLabel = 'items';
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.total || 0) / (this.limit || 1)));
  }

  get startItem(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endItem(): number {
    return Math.min(this.total, this.page * this.limit);
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>([
      1,
      this.totalPages,
      this.page - 1,
      this.page,
      this.page + 1,
    ]);

    return Array.from(pages)
      .filter((p) => p >= 1 && p <= this.totalPages)
      .sort((a, b) => a - b);
  }

  goToPage(nextPage: number): void {
    if (this.disabled || nextPage < 1 || nextPage > this.totalPages || nextPage === this.page) {
      return;
    }
    this.pageChange.emit(nextPage);
  }
}
