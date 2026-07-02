import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MerchantApiKeys } from '../merchant-api-keys/merchant-api-keys';
import { MerchantDocuments } from '../merchant-documents/merchant-documents';
import { MerchantInvoices } from '../merchant-invoices/merchant-invoices';
import { MerchantPayments } from '../merchant-payments/merchant-payments';
import { MerchantShipments } from '../merchant-shipments/merchant-shipments';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

// The shape the HTML template binds to — kept identical to avoid touching the
// template. Fields not present in the DB are filled with '—' (an em dash) so
// they render clearly as "not available" rather than blank or null.
interface MerchantViewModel {
  id: string;
  merchantName: string;
  displayName: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  gstNumber: string;
  panNumber: string;
  paymentTerms: string;
  creditLimit: number | string;
  status: string;
  distributorName: string;
  distributorId: string;
  warehouseDetails: string;
  registrationDate: string;
}

// DB → ViewModel mapping. Any field that has no equivalent column is '—'.
function toViewModel(user: MerchantUser): MerchantViewModel {
  const w = user.warehouse;
  return {
    id:               user.id,
    // companyName is the closest to "merchant name" in the DB
    merchantName:     user.companyName || `${user.firstName} ${user.lastName}`,
    // No separate displayName column — show company name if available
    displayName:      user.companyName || '—',
    email:            user.email,
    phone:            user.phone || '—',
    // Top-level address field (free text, not structured)
    address:          user.address || (w ? `${w.address}, ${w.city}, ${w.state} - ${w.pincode}` : '—'),
    // No region column in DB
    region:           '—',
    city:             w?.city  || '—',
    state:            w?.state || '—',
    pincode:          w?.pincode || '—',
    // contactPerson lives on the warehouse document
    contactPerson:    w?.contactPerson || `${user.firstName} ${user.lastName}`,
    contactPhone:     w?.phone || user.phone || '—',
    contactEmail:     w?.email || user.email,
    // gstNo is on the warehouse; no dedicated user-level GST field
    gstNumber:        w?.gstNo || '—',
    // No PAN column in DB
    panNumber:        '—',
    // No payment terms column in DB
    paymentTerms:     '—',
    // No credit limit column in DB
    creditLimit:      '—',
    status:           user.isActive ? 'Active' : 'Inactive',
    // invitedBy is the distributor's ObjectId — name not populated by this endpoint
    distributorName:  '—',
    distributorId:    typeof user.invitedBy === 'string' ? user.invitedBy : '—',
    // Warehouse name or ID as the "warehouse details" label
    warehouseDetails: w ? (w.name || w.warehouseId) : '—',
    registrationDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
  };
}

@Component({
  selector: 'app-update-merchant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MerchantApiKeys, MerchantDocuments, MerchantInvoices,
    MerchantPayments, MerchantShipments,
  ],
  templateUrl: './merchant-profile.html',
  styleUrl: './merchant-profile.css'
})
export class MerchantProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private merchantService = inject(MerchantService);

  activeTab = 'profile';
  merchantId!: string;

  isLoading = signal(true);
  errorMessage = signal('');

  // Initialised with blank strings so template bindings never blow up before
  // data arrives.
  merchant: MerchantViewModel = {
    id: '', merchantName: '', displayName: '', email: '', phone: '',
    address: '', region: '', city: '', state: '', pincode: '',
    contactPerson: '', contactPhone: '', contactEmail: '',
    gstNumber: '', panNumber: '', paymentTerms: '', creditLimit: '',
    status: 'Active', distributorName: '', distributorId: '',
    warehouseDetails: '', registrationDate: '',
  };

  // Stats and tracking remain static for now — not available from this endpoint
  stats = {
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    inTransitOrders: 0,
    reversePickups: 0,
    weightDisputes: 0,
  };

  trackingData: any[] = [];

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
        this.merchant = toViewModel(res.data);
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
    // Optimistic local toggle — wire to PATCH /users/:id when ready
    this.merchant.status = this.merchant.status === 'Active' ? 'Inactive' : 'Active';
    alert(`Merchant ${this.merchant.status === 'Active' ? 'Activated' : 'Deactivated'} Successfully`);
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
