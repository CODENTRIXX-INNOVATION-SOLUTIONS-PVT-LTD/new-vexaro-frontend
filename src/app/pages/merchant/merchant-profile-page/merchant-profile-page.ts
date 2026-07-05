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
    shopName: '', businessName: '', gstNumber: '',
    businessType: '', registrationNumber: '', registrationDate: '',
  };

  owner = {
    ownerName: '', mobile: '', email: '',
    alternateContact: '', designation: '', aadhaarNumber: '',
  };

  address = {
    streetAddress: '', landmark: '',
    city: '', state: '', pincode: '', country: 'India',
  };

  readonly businessTypes = [
    'Courier & Logistics Services', 'E-Commerce Fulfillment',
    'Last Mile Delivery', 'Freight & Cargo',
    'Cold Chain Logistics', 'Hyperlocal Delivery',
  ];

  readonly states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
    'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

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
        this.shop.gstNumber    = u.gstNumber   ?? '';
        this.shop.businessType = u.businessType ?? '';
        this.shop.registrationNumber = u.registrationNumber ?? '';
        this.shop.registrationDate   = u.registrationDate
          ? new Date(u.registrationDate).toISOString().slice(0, 10) : '';

        const first = u.firstName ?? '';
        const last  = u.lastName  ?? '';
        this.owner.ownerName = `${first} ${last}`.trim();
        this.owner.mobile    = u.phone ?? '';
        this.owner.email     = u.email ?? '';

        this.address.streetAddress = u.address ?? '';
        this.address.city          = u.city    ?? '';
        this.address.state         = u.state   ?? '';
        this.address.pincode       = u.pincode ?? '';
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to load profile.'; },
    });
  }

  saveChanges(): void {
    this.isSaving   = true;
    this.error      = '';
    this.saveSuccess = false;

    const nameParts = this.owner.ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName  = nameParts.slice(1).join(' ') || '';

    this.settingsService.updateProfile({
      firstName,
      lastName,
      phone:       this.owner.mobile     || undefined,
      companyName: this.shop.shopName    || undefined,
      address:     this.address.streetAddress || undefined,
    }).pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => { this.saveSuccess = false; }, 3500);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to save changes.'; },
    });
  }
}
