import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisputeService } from '../../../../services/dispute.service';

const CATEGORY_LABELS: Record<string, string> = {
  WEIGHT_DISPUTE: 'Weight Mismatch',
  LOST: 'Lost Package',
  DAMAGED: 'Damaged',
  DELAY: 'Delivery Delay',
  WRONG_DELIVERY: 'Wrong Delivery',
  COD_MISMATCH: 'COD Mismatch',
  OTHER: 'Other',
};

@Component({
  selector: 'app-dispute-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-list.html',
  styleUrl: './dispute-list.css',
})
export class DisputeList implements OnInit {
  private router = inject(Router);
  private disputeService = inject(DisputeService);

  disputes: any[] = [];
  filteredDisputes: any[] = [];
  isLoading = false;
  error = '';

  statusFilter = '';
  searchTerm = '';

  page = 1;
  total = 0;
  readonly limit = 20;

  get totalPages(): number {
    return Math.ceil(this.total / this.limit) || 1;
  }

  ngOnInit(): void {
    this.loadDisputes();
  }

  loadDisputes(): void {
    this.isLoading = true;
    this.error = '';

    const params: any = { page: this.page, limit: this.limit };
    if (this.statusFilter) params.status = this.statusFilter;

    this.disputeService.listDisputes(params).subscribe({
      next: (res) => {
        this.total = res?.meta?.total ?? 0;
        const raw: any[] = res?.data?.disputes ?? res?.data?.items ?? [];
        this.disputes = raw.map((d) => ({
          id: d._id,
          awb: d.shipmentId?.awb ?? '-',
          merchantName: d.raisedBy
            ? `${d.raisedBy.firstName ?? ''} ${d.raisedBy.lastName ?? ''}`.trim() || d.raisedBy.email || '-'
            : '-',
          category: CATEGORY_LABELS[d.category] ?? d.category ?? '-',
          status: d.status,
          description: d.description ?? '',
          resolution: d.resolution ?? '',
          createdAt: this.formatDate(d.createdAt),
          resolvedAt: this.formatDate(d.resolvedAt),
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load disputes.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.filteredDisputes = this.disputes.filter((d) =>
      (!q ||
        d.awb.toLowerCase().includes(q) ||
        d.merchantName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)) &&
      (!this.statusFilter || d.status === this.statusFilter),
    );
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadDisputes();
  }

  viewDispute(id: string): void {
    this.router.navigate(['/distributor/disputes', id]);
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadDisputes();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadDisputes();
    }
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
