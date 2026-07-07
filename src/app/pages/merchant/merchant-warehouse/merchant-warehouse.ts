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
  showAddressRequestConfirmation = false;

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

  loadWarehouses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.listMyWarehouses().pipe(
      finalize(() => { this.isLoading = false; }),
    ).subscribe({
      next: (res) => {
        this.warehouses = res?.data?.warehouses || [];
        this.selectWarehouse(this.warehouses[0] || null);
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
    this.contactPhone = warehouse?.phone || '';
    this.contactEmail = warehouse?.email || '';
    this.gstNumber = warehouse?.gstNo || '';

    this.requestedAddressLine = warehouse?.address || '';
    this.requestedCity = warehouse?.city || '';
    this.requestedState = warehouse?.state || '';
    this.requestedPincode = warehouse?.pincode || '';
    this.requestedCountry = warehouse?.country || 'India';
  }

  saveDetails(): void {
    if (!this.selectedWarehouse?._id) {
      this.formError = 'No active warehouse is available to update.';
      return;
    }
    if (!this.contactPerson.trim() || !/^[6-9]\d{9}$/.test(this.contactPhone.trim())) {
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

    this.merchantService.updateWarehouseContact(this.selectedWarehouse._id, {
      contactPerson: this.contactPerson.trim(),
      phone: this.contactPhone.trim(),
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
    if (!this.selectedWarehouse?._id) {
      this.requestError = 'No active warehouse is available for address change.';
      return;
    }
    this.showAddressRequestConfirmation = true;
  }

  submitAddressChangeRequest(): void {
    if (!this.selectedWarehouse?._id) return;
    if (!this.requestedAddressLine.trim() || !this.requestedCity.trim() || !this.requestedState.trim() || !/^\d{6}$/.test(this.requestedPincode.trim())) {
      this.requestError = 'Address line, city, state, and a valid 6-digit pincode are required.';
      return;
    }

    this.isRequestingAddressChange = true;
    this.requestError = '';

    this.merchantService.requestWarehouseAddressChange(this.selectedWarehouse._id, {
      addressLine: this.requestedAddressLine.trim(),
      city: this.requestedCity.trim(),
      state: this.requestedState.trim(),
      pincode: this.requestedPincode.trim(),
      country: this.requestedCountry.trim() || 'India',
    }).pipe(finalize(() => { this.isRequestingAddressChange = false; })).subscribe({
      next: () => {
        this.closeAddressRequest();
        this.saveSuccess = true;
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
}
