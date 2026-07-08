import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-merchant-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-profile-page.html',
  styleUrl: './merchant-profile-page.css',
})
export class MerchantProfilePage implements OnInit {
  private settingsService = inject(SettingsService);

  activeTab   = 'shop';
  // Template uses plain boolean, not signal
  saveSuccess = false;
  isSaving    = false;
  error       = '';

  shop = {
    shopName: '', businessName: '',
  };

  owner = {
    ownerName: '', mobile: '', email: '',
  };

  address = {
    streetAddress: '',
  };

  ngOnInit(): void { this.loadProfile(); }

  changeTab(tab: string): void {
    this.activeTab   = tab;
    this.saveSuccess = false;
    this.error       = '';
  }

  private loadProfile(): void {
    this.settingsService.getProfile().subscribe({
      next: (res) => {
        const u = res?.data ?? res;
        this.shop.shopName     = u.companyName ?? '';
        this.shop.businessName = u.companyName ?? '';

        const first = u.firstName ?? '';
        const last  = u.lastName  ?? '';
        this.owner.ownerName = `${first} ${last}`.trim();
        this.owner.mobile    = String(u.phone ?? '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
        this.owner.email     = u.email ?? '';

        this.address.streetAddress = u.address ?? '';
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to load profile.'; },
    });
  }

  saveChanges(): void {
    const nameParts = this.owner.ownerName.trim().split(/\s+/).filter(Boolean);
    const payload: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      companyName?: string;
      address?: string;
    } = {};

    if (nameParts[0]) payload.firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ').trim();
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

    const companyName = (this.shop.shopName || this.shop.businessName).trim();
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
}
