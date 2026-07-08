import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../../services/settings.service';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-merchant-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './merchant-profile-page.html',
  styleUrl: './merchant-profile-page.css',
})
export class MerchantProfilePage implements OnInit {
  private settingsService = inject(SettingsService);
  private merchantService = inject(MerchantService);

  activeTab   = 'shop';
  // Template uses plain boolean, not signal
  saveSuccess = false;
  isSaving    = false;
  isLoading   = false;
  error       = '';
  warehouseError = '';

  shop = {
    companyName: '',
    businessName: '',
    merchantId: '',
    role: '',
    status: '',
    createdAt: '',
    lastLoginAt: '',
  };

  owner = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
  };

  address = {
    streetAddress: '',
  };

  warehouse = {
    mongoId: '',
    warehouseId: '',
    velocityWarehouseId: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstNo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isActive: false,
  };

  ngOnInit(): void {
    this.loadProfile();
    this.loadWarehouse();
  }

  get displayName(): string {
    return [this.owner.firstName, this.owner.lastName].filter(Boolean).join(' ') || this.shop.companyName || 'Merchant Profile';
  }

  changeTab(tab: string): void {
    this.activeTab   = tab;
    this.saveSuccess = false;
    this.error       = '';
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.settingsService.getProfile().subscribe({
      next: (res) => {
        const u = res?.data ?? res;
        this.shop.companyName  = u.companyName ?? '';
        this.shop.businessName = u.companyName ?? '';
        this.shop.merchantId   = u.id ?? u._id ?? '';
        this.shop.role         = u.role ?? '';
        this.shop.status       = u.isActive ? 'Active' : 'Inactive';
        this.shop.createdAt    = this.formatDate(u.createdAt);
        this.shop.lastLoginAt  = this.formatDate(u.lastLoginAt);

        this.owner.firstName = u.firstName ?? '';
        this.owner.lastName  = u.lastName  ?? '';
        this.owner.mobile    = String(u.phone ?? '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
        this.owner.email     = u.email ?? '';

        this.address.streetAddress = u.address ?? '';
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load profile.';
        this.isLoading = false;
      },
    });
  }

  private loadWarehouse(): void {
    this.warehouseError = '';
    this.merchantService.listMyWarehouses().subscribe({
      next: (res) => {
        const wh: MerchantWarehouse | undefined = res?.data?.warehouses?.[0];
        if (!wh) {
          this.warehouseError = 'No active pickup warehouse is assigned to this merchant.';
          return;
        }
        this.warehouse = {
          mongoId: wh._id || wh.id || '',
          warehouseId: wh.warehouseId || '',
          velocityWarehouseId: wh.velocityWarehouseId || '',
          name: wh.name || '',
          contactPerson: wh.contactPerson || '',
          phone: String(wh.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''),
          email: wh.email || '',
          gstNo: wh.gstNo || '',
          address: wh.address || '',
          city: wh.city || '',
          state: wh.state || '',
          pincode: wh.pincode || '',
          country: wh.country || 'India',
          isActive: Boolean(wh.isActive),
        };
      },
      error: (err) => {
        this.warehouseError = err?.error?.message || 'Failed to load warehouse details.';
      },
    });
  }

  saveChanges(): void {
    const payload: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      companyName?: string;
      address?: string;
    } = {};

    const firstName = this.owner.firstName.trim();
    const lastName = this.owner.lastName.trim();
    if (firstName) payload.firstName = firstName;
    if (lastName) payload.lastName = lastName;

    const phone = this.owner.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').trim();
    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        this.error = 'Enter a valid 10-digit mobile number.';
        this.saveSuccess = false;
        return;
      }
      payload.phone = phone;
    }

    const companyName = (this.shop.companyName || this.shop.businessName).trim();
    if (companyName) payload.companyName = companyName;

    const address = this.address.streetAddress.trim();
    if (address) payload.address = address;

    if (!Object.keys(payload).length) {
      this.error = 'At least one profile field is required.';
      this.saveSuccess = false;
      return;
    }

    this.isSaving   = true;
    this.error      = '';
    this.saveSuccess = false;

    this.settingsService.updateProfile(payload).pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => { this.saveSuccess = false; }, 3500);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to save changes.'; },
    });
  }

  saveWarehouseContact(): void {
    if (!this.warehouse.mongoId) {
      this.warehouseError = 'No active warehouse is available to update.';
      return;
    }

    const phone = this.warehouse.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').trim();
    if (!this.warehouse.contactPerson.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      this.warehouseError = 'Warehouse contact person and valid 10-digit phone are required.';
      return;
    }
    if (this.warehouse.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.warehouse.email.trim())) {
      this.warehouseError = 'Enter a valid warehouse email address.';
      return;
    }

    this.isSaving = true;
    this.warehouseError = '';
    this.saveSuccess = false;

    this.merchantService.updateWarehouseContact(this.warehouse.mongoId, {
      contactPerson: this.warehouse.contactPerson.trim(),
      phone,
      ...(this.warehouse.email.trim() ? { email: this.warehouse.email.trim() } : {}),
    }).pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next: () => {
        this.saveSuccess = true;
        this.loadWarehouse();
        setTimeout(() => { this.saveSuccess = false; }, 3500);
      },
      error: (err) => {
        this.warehouseError = err?.error?.message || 'Failed to save warehouse contact details.';
      },
    });
  }

  private formatDate(value: string | null | undefined): string {
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
}
