import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MerchantService, MerchantWarehouse as WarehouseRecord } from '../../../services/merchant.service';

@Component({
  selector: 'app-merchant-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-warehouse.html',
  styleUrl: './merchant-warehouse.css',
})
export class MerchantWarehouse implements OnInit {
  private merchantService = inject(MerchantService);

  warehouses: WarehouseRecord[] = [];
  selectedWarehouse: WarehouseRecord | null = null;

  isLoading = false;
  isSaving = false;
  isRequestingAddressChange = false;
  saveSuccess = false;
  errorMessage = '';
  formError = '';
  requestError = '';
  requestListError = '';
  showAddressRequestConfirmation = false;
  addressRequests: any[] = [];
  requestPage = 1;
  requestLimit = 5;
  requestTotalPages = 1;
  requestHasPrevPage = false;
  requestHasNextPage = false;
  isLoadingRequests = false;
  cancellingRequestId = '';

  warehouseName = '';
  contactPerson = '';
  contactPhone = '';
  contactEmail = '';
  gstNumber = '';

  requestedAddressLine = '';
  requestedCity = '';
  requestedState = '';
  requestedPincode = '';
  requestedCountry = 'India';

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadAddressRequests();
  }

  get warehouseId(): string {
    return this.selectedWarehouse?.warehouseId || 'Pending';
  }

  get streetAddress(): string {
    return this.selectedWarehouse?.address || '—';
  }

  get city(): string {
    return this.selectedWarehouse?.city || '—';
  }

  get state(): string {
    return this.selectedWarehouse?.state || '—';
  }

  get pincode(): string {
    return this.selectedWarehouse?.pincode || '—';
  }

  get velocityWarehouseId(): string {
    return this.selectedWarehouse?.velocityWarehouseId || 'Not synced yet';
  }

  private get activeWarehouseId(): string {
    return this.selectedWarehouse?._id || this.selectedWarehouse?.id || '';
  }

  private normalizeIndianPhone(value: string | null | undefined): string {
    return String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  }

  loadWarehouses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.listMyWarehouses().pipe(
      finalize(() => { this.isLoading = false; }),
    ).subscribe({
      next: (res) => {
        this.warehouses = res?.data?.warehouses || [];
        this.selectWarehouse(this.warehouses[0] || null);
        this.loadAddressRequests();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load warehouse details.';
      },
    });
  }

  selectWarehouse(warehouse: WarehouseRecord | null): void {
    this.selectedWarehouse = warehouse;
    this.formError = '';
    this.requestError = '';

    this.warehouseName = warehouse?.name || '';
    this.contactPerson = warehouse?.contactPerson || '';
    this.contactPhone = this.normalizeIndianPhone(warehouse?.phone);
    this.contactEmail = warehouse?.email || '';
    this.gstNumber = warehouse?.gstNo || '';

    this.requestedAddressLine = warehouse?.address || '';
    this.requestedCity = warehouse?.city || '';
    this.requestedState = warehouse?.state || '';
    this.requestedPincode = warehouse?.pincode || '';
    this.requestedCountry = warehouse?.country || 'India';
  }

  saveDetails(): void {
    const warehouseId = this.activeWarehouseId;
    if (!warehouseId) {
      this.formError = 'No active warehouse is available to update.';
      return;
    }
    const phone = this.normalizeIndianPhone(this.contactPhone);
    if (!this.contactPerson.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      this.formError = 'Contact person and a valid 10-digit phone number are required.';
      return;
    }
    if (this.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactEmail.trim())) {
      this.formError = 'Enter a valid email address.';
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.saveSuccess = false;

    this.merchantService.updateWarehouseContact(warehouseId, {
      contactPerson: this.contactPerson.trim(),
      phone,
      ...(this.contactEmail.trim() ? { email: this.contactEmail.trim() } : {}),
    }).pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next: (res) => {
        const updated = res?.data || res;
        this.saveSuccess = true;
        this.selectedWarehouse = { ...this.selectedWarehouse!, ...updated };
        setTimeout(() => { this.saveSuccess = false; }, 3000);
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to save warehouse contact details.';
      },
    });
  }

  requestAddressChange(): void {
    if (!this.activeWarehouseId) {
      this.requestError = 'No active warehouse is available for address change.';
      return;
    }
    this.showAddressRequestConfirmation = true;
  }

  submitAddressChangeRequest(): void {
    const warehouseId = this.activeWarehouseId;
    if (!warehouseId) return;
    if (!this.requestedAddressLine.trim() || !this.requestedCity.trim() || !this.requestedState.trim() || !/^\d{6}$/.test(this.requestedPincode.trim())) {
      this.requestError = 'Address line, city, state, and a valid 6-digit pincode are required.';
      return;
    }

    this.isRequestingAddressChange = true;
    this.requestError = '';

    this.merchantService.requestWarehouseAddressChange(warehouseId, {
      addressLine: this.requestedAddressLine.trim(),
      city: this.requestedCity.trim(),
      state: this.requestedState.trim(),
      pincode: this.requestedPincode.trim(),
      country: this.requestedCountry.trim() || 'India',
    }).pipe(finalize(() => { this.isRequestingAddressChange = false; })).subscribe({
      next: () => {
        this.closeAddressRequest();
        this.saveSuccess = true;
        this.loadAddressRequests();
        setTimeout(() => { this.saveSuccess = false; }, 3000);
      },
      error: (err) => {
        this.requestError = err?.error?.message || 'Failed to submit address change request.';
      },
    });
  }

  closeAddressRequest(): void {
    this.showAddressRequestConfirmation = false;
    this.requestError = '';
  }

  loadAddressRequests(page = this.requestPage): void {
    this.isLoadingRequests = true;
    this.requestListError = '';
    this.requestPage = page;

    this.merchantService.listWarehouseAddressChangeRequests({
      page: this.requestPage,
      limit: this.requestLimit,
    }).pipe(finalize(() => { this.isLoadingRequests = false; })).subscribe({
      next: (res) => {
        this.addressRequests = (res?.data?.requests || []).map((request: any) => this.mapAddressRequest(request));
        const meta = res?.meta || {};
        this.requestTotalPages = meta.pages || 1;
        this.requestHasPrevPage = Boolean(meta.hasPrevPage);
        this.requestHasNextPage = Boolean(meta.hasNextPage);
      },
      error: (err) => {
        this.requestListError = err?.error?.message || 'Failed to load address change requests.';
      },
    });
  }

  cancelAddressRequest(request: any): void {
    if (!request?.id || request.status !== 'PENDING') return;
    this.cancellingRequestId = request.id;
    this.requestListError = '';

    this.merchantService.cancelWarehouseAddressChangeRequest(request.id).pipe(
      finalize(() => { this.cancellingRequestId = ''; }),
    ).subscribe({
      next: () => {
        this.saveSuccess = true;
        this.loadAddressRequests();
        setTimeout(() => { this.saveSuccess = false; }, 3000);
      },
      error: (err) => {
        this.requestListError = err?.error?.message || 'Failed to cancel request.';
      },
    });
  }

  formatDate(value: string): string {
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

  getRequestStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return 'status-pill approved';
      case 'REJECTED': return 'status-pill rejected';
      case 'CANCELLED': return 'status-pill cancelled';
      default: return 'status-pill pending';
    }
  }

  private mapAddressRequest(request: any): any {
    const requested = request.requestedAddress || {};
    const current = request.currentAddress || {};
    return {
      id: request._id,
      warehouseId: request.warehouseId?.warehouseId || request.warehouseId?._id || request.warehouseId || '-',
      status: request.status || 'PENDING',
      createdAt: request.createdAt,
      processedAt: request.processedAt,
      rejectionReason: request.rejectionReason || '',
      currentAddress: this.formatRequestAddress(current),
      requestedAddress: this.formatRequestAddress(requested),
    };
  }

  private formatRequestAddress(address: any): string {
    return [
      address.addressLine,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ].filter(Boolean).join(', ') || '-';
  }
}
