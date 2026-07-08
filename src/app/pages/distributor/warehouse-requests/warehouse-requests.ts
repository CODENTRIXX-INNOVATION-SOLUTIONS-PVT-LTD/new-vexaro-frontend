import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MerchantService } from '../../../services/merchant.service';

interface WarehouseRequestRow {
  id: string;
  warehouseId: string;
  merchantName: string;
  merchantEmail: string;
  currentAddress: string;
  requestedAddress: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
  processedAt: string;
  rejectInput: string;
}

@Component({
  selector: 'app-distributor-warehouse-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-requests.html',
  styleUrl: './warehouse-requests.css',
})
export class DistributorWarehouseRequests implements OnInit {
  private merchantService = inject(MerchantService);

  requests: WarehouseRequestRow[] = [];
  statusFilter = '';
  isLoading = false;
  error = '';
  success = '';
  actionRequestId = '';

  page = 1;
  readonly limit = 10;
  total = 0;
  pages = 1;
  hasPrevPage = false;
  hasNextPage = false;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(page = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.error = '';

    this.merchantService.listDistributorWarehouseChangeRequests({
      page: this.page,
      limit: this.limit,
      ...(this.statusFilter ? { status: this.statusFilter } : {}),
    }).pipe(finalize(() => { this.isLoading = false; })).subscribe({
      next: (res) => {
        this.requests = (res?.data?.requests || []).map((request: any) => this.mapRequest(request));
        const meta = res?.meta || {};
        this.total = meta.total || this.requests.length;
        this.pages = meta.pages || 1;
        this.hasPrevPage = Boolean(meta.hasPrevPage);
        this.hasNextPage = Boolean(meta.hasNextPage);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load warehouse requests.';
      },
    });
  }

  applyFilter(): void {
    this.success = '';
    this.loadRequests(1);
  }

  approve(request: WarehouseRequestRow): void {
    if (request.status !== 'PENDING') return;
    this.actionRequestId = request.id;
    this.error = '';
    this.success = '';

    this.merchantService.approveWarehouseAddressChangeRequest(request.id).pipe(
      finalize(() => { this.actionRequestId = ''; }),
    ).subscribe({
      next: () => {
        this.success = `Warehouse request ${request.warehouseId} approved.`;
        this.loadRequests(this.page);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to approve request.';
      },
    });
  }

  reject(request: WarehouseRequestRow): void {
    if (request.status !== 'PENDING') return;
    const reason = request.rejectInput.trim();
    if (reason.length < 10) {
      this.error = 'Rejection reason must be at least 10 characters.';
      return;
    }

    this.actionRequestId = request.id;
    this.error = '';
    this.success = '';

    this.merchantService.rejectWarehouseAddressChangeRequest(request.id, reason).pipe(
      finalize(() => { this.actionRequestId = ''; }),
    ).subscribe({
      next: () => {
        this.success = `Warehouse request ${request.warehouseId} rejected.`;
        this.loadRequests(this.page);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to reject request.';
      },
    });
  }

  prevPage(): void {
    if (this.hasPrevPage) this.loadRequests(this.page - 1);
  }

  nextPage(): void {
    if (this.hasNextPage) this.loadRequests(this.page + 1);
  }

  statusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return 'status approved';
      case 'REJECTED': return 'status rejected';
      case 'CANCELLED': return 'status cancelled';
      default: return 'status pending';
    }
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private mapRequest(request: any): WarehouseRequestRow {
    const merchant = request.merchantId || {};
    const warehouse = request.warehouseId || {};
    return {
      id: request._id || request.id,
      warehouseId: warehouse.warehouseId || warehouse._id || request.warehouseId || '-',
      merchantName: merchant.companyName || [merchant.firstName, merchant.lastName].filter(Boolean).join(' ') || '-',
      merchantEmail: merchant.email || '-',
      currentAddress: this.formatAddress(request.currentAddress),
      requestedAddress: this.formatAddress(request.requestedAddress),
      status: request.status || 'PENDING',
      rejectionReason: request.rejectionReason || '',
      createdAt: request.createdAt,
      processedAt: request.processedAt,
      rejectInput: '',
    };
  }

  private formatAddress(address: any): string {
    return [
      address?.addressLine,
      address?.city,
      address?.state,
      address?.pincode,
      address?.country,
    ].filter(Boolean).join(', ') || '-';
  }
}
