import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MerchantShipments } from '../merchant-shipments/merchant-shipments';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';
import { UserService } from '../../../../services/user.service';

// The shape the HTML template binds to — kept identical to avoid touching the
// template. Fields not present in the DB are filled with '—' (an em dash) so
// they render clearly as "not available" rather than blank or null.
interface MerchantViewModel {
  id: string;
  merchantName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  gstNumber: string;
  status: string;
  activationStatus: string;
  distributorId: string;
  warehouseDetails: string;
  registrationDate: string;
}

// DB → ViewModel mapping
function toViewModel(user: MerchantUser): MerchantViewModel {
  const w = user.warehouse;
  let status = user.isActive ? 'Active' : 'Inactive';
  let activationStatus = '';

  // Determine if user is not activated
  const isNotActivated = user.mustChangeCredentials || !user.lastLoginAt;

  if (isNotActivated) {
    if (user.mustChangeCredentials) {
      status = 'Not Set Password';
    } else if (!user.lastLoginAt) {
      status = 'Not Activated';
    }
  }

  return {
    id: user.id,
    merchantName: user.companyName || `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || '—',
    address: user.address || (w ? `${w.address}, ${w.city}, ${w.state} - ${w.pincode}` : '—'),
    city: w?.city || '—',
    state: w?.state || '—',
    pincode: w?.pincode || '—',
    contactPerson: w?.contactPerson || `${user.firstName} ${user.lastName}`,
    contactPhone: w?.phone || user.phone || '—',
    contactEmail: w?.email || user.email,
    gstNumber: w?.gstNo || '—',
    status: status,
    activationStatus: activationStatus,
    distributorId: typeof user.invitedBy === 'string' ? user.invitedBy : '—',
    warehouseDetails: w ? (w.name || w.warehouseId) : '—',
    registrationDate: user.createdAt
      ? new Date(user.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—',
  };
}

@Component({
  selector: 'app-update-merchant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MerchantShipments,
  ],
  templateUrl: './merchant-profile.html',
  styleUrl: './merchant-profile.css'
})
export class MerchantProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private userService = inject(UserService);

  activeTab = 'profile';
  merchantId!: string;

  isLoading = signal(true);
  errorMessage = signal('');
  isResending = signal(false);

  // Initialised with blank strings so template bindings never blow up before
  // data arrives.
  merchant: MerchantViewModel = {
    id: '', merchantName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    contactPerson: '', contactPhone: '', contactEmail: '',
    gstNumber: '', status: 'Active', activationStatus: '', distributorId: '',
    warehouseDetails: '', registrationDate: '',
  };

  // Stats and tracking remain static for now — not available from this endpoint
  stats = {
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    inTransitOrders: 0,
    reversePickups: 0,
  };


  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.merchantId) {
      this.router.navigate(['/super-admin/merchants']);
      return;
    }
    this.loadMerchant();
  }

  loadMerchant(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.merchantService.getMerchantById(this.merchantId).subscribe({
      next: (res) => {
        console.log('Raw merchant data:', res.data);
        console.log('isActive:', res.data.isActive);
        console.log('mustChangeCredentials:', res.data.mustChangeCredentials);
        console.log('lastLoginAt:', res.data.lastLoginAt);

        this.merchant = toViewModel(res.data);
        console.log('Transformed status:', this.merchant.status);
        console.log('isNotActivated():', this.isNotActivated());

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load merchant profile.'
        );
        this.isLoading.set(false);
      },
    });
  }

  changeTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleStatus(): void {
    const newStatus = this.merchant.status === 'Active' ? false : true;
    const statusText = newStatus ? 'Activated' : 'Deactivated';

    this.userService.updateUserStatus(this.merchantId, newStatus).subscribe({
      next: (response: any) => {
        this.merchant.status = newStatus ? 'Active' : 'Inactive';
        alert(`Merchant ${statusText} Successfully`);
        this.loadMerchant(); // Reload to get fresh data from backend
      },
      error: (err: any) => {
        alert(`Failed to ${statusText.toLowerCase()} merchant: ${err?.error?.message || 'Unknown error'}`);
      }
    });
  }

  deleteMerchant(): void {
    const merchantName = this.merchant.merchantName;
    const confirmed = window.confirm(
      `Delete merchant "${merchantName}"? This will disable their portal access and remove them from active merchant lists. This action cannot be undone.`
    );
    if (!confirmed) return;

    this.userService.deactivateUser(this.merchantId).subscribe({
      next: () => {
        alert('Merchant deleted successfully');
        this.router.navigate(['/super-admin/merchants']);
      },
      error: (err: any) => {
        alert(`Failed to delete merchant: ${err?.error?.message || 'Unknown error'}`);
      }
    });
  }

  resendInvitation(): void {
    this.isResending.set(true);

    this.userService.resendInvite(this.merchantId).subscribe({
      next: () => {
        this.isResending.set(false);
        alert('Invitation resent successfully to ' + this.merchant.email);
        this.loadMerchant(); // Reload to get updated data
      },
      error: (err: any) => {
        this.isResending.set(false);
        alert(`Failed to resend invitation: ${err?.error?.message || 'Unknown error'}`);
      }
    });
  }

  isNotActivated(): boolean {
    return this.merchant.status === 'Not Set Password' || this.merchant.status === 'Not Activated';
  }

  assignWarehouse(): void {
    alert('Assign Warehouse feature coming soon');
  }

  generateLogin(): void {
    alert('Generate Login feature coming soon');
  }

  updatemMrchant(): void {
    console.log(this.merchant);
    alert('Merchant Updated Successfully');
  }
}