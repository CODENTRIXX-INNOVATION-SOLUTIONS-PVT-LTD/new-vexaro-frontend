import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';
import { FinanceService } from '../../../../services/finance.service';
import { UserService } from '../../../../services/user.service';
import { ShipmentService } from '../../../../services/shipment.service';

interface MerchantView {
  merchantCode: string;
  businessName: string;
  displayName: string;
  contactPerson: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  warehouseId: string;
  walletBalance: number;
  creditLimit: number;
  paymentTerms: string;
  totalShipments: number;
  deliveredShipments: number;
  status: string;
  joinedDate: string;
}

function toView(user: MerchantUser, walletBalance: number): MerchantView {
  const w = user.warehouse;
  return {
    merchantCode:       user.id ? `MRC-${user.id.slice(-6).toUpperCase()}` : '—',
    businessName:       user.companyName || `${user.firstName} ${user.lastName}`.trim(),
    displayName:        user.companyName || `${user.firstName} ${user.lastName}`.trim(),
    contactPerson:      `${user.firstName} ${user.lastName}`.trim(),
    phone:              user.phone || '—',
    email:              user.email,
    addressLine1:       user.address || (w ? `${w.address}, ${w.city}, ${w.state}` : '—'),
    city:               w?.city    || '—',
    state:              w?.state   || '—',
    pincode:            w?.pincode || '—',
    gstin:              w?.gstNo   || '—',
    pan:                '—',
    warehouseId:        w?.warehouseId || '—',
    walletBalance,
    creditLimit:        0,
    paymentTerms:       'Prepaid',
    totalShipments:     0,
    deliveredShipments: 0,
    status:             user.isActive ? 'Active' : 'Inactive',
    joinedDate:         user.createdAt
      ? new Date(user.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—',
  };
}

@Component({
  selector: 'app-distributor-merchant-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-profile.html',
  styleUrl: './merchant-profile.css',
})
export class DistributorMerchantProfile implements OnInit {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private merchantService = inject(MerchantService);
  private financeService  = inject(FinanceService);
  private userService     = inject(UserService);
  private shipmentService = inject(ShipmentService);

  merchantId   = '';
  activeTab    = 'overview';
  isLoading    = true;
  isSaving     = false;
  errorMessage = '';

  merchant: MerchantView = {
    merchantCode: '', businessName: '', displayName: '', contactPerson: '',
    phone: '', email: '', addressLine1: '', city: '', state: '', pincode: '',
    gstin: '', pan: '', warehouseId: '', walletBalance: 0, creditLimit: 0,
    paymentTerms: 'Prepaid', totalShipments: 0, deliveredShipments: 0,
    status: 'Active', joinedDate: '',
  };

  // ── Shipments tab ────────────────────────────────────────────────────────
  shipments: any[]     = [];
  shipmentsLoading     = false;
  shipmentsError       = '';
  shipmentsPage        = 1;
  shipmentsTotal       = 0;
  readonly shipmentsLimit = 15;
  shipmentsFilter      = '';

  get shipmentsTotalPages(): number {
    return Math.ceil(this.shipmentsTotal / this.shipmentsLimit) || 1;
  }

  readonly STATUS_LABELS: Record<string, string> = {
    ORDER_CREATED:    'Pending',
    PICKED_UP:        'Picked Up',
    ARRIVED_AT_HUB:   'At Hub',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED:        'Delivered',
    DELIVERY_FAILED:  'Failed',
    RTO:              'RTO',
    CANCELLED:        'Cancelled',
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.merchantId) {
      this.router.navigate(['/distributor/merchants']);
      return;
    }
    this.loadMerchant();
  }

  // ── Profile load ─────────────────────────────────────────────────────────
  loadMerchant(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    const user$   = this.merchantService.getMerchantById(this.merchantId).pipe(catchError(() => of(null)));
    const wallet$ = this.financeService.listWallets({ userId: this.merchantId, limit: 1 }).pipe(catchError(() => of(null)));

    forkJoin([user$, wallet$]).subscribe({
      next: ([userRes, walletRes]) => {
        if (!userRes?.data) {
          this.errorMessage = 'Merchant not found.';
          this.isLoading    = false;
          return;
        }
        const wallets: any[] = walletRes?.data?.wallets ?? [];
        const balance = wallets.find(
          (w: any) => w.userId?._id === this.merchantId || w.userId === this.merchantId
        )?.balance ?? 0;
        this.merchant  = toView(userRes.data, balance);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load merchant profile.';
        this.isLoading    = false;
      },
    });
  }

  // ── Tab switching ────────────────────────────────────────────────────────
  changeTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'shipments' && this.shipments.length === 0 && !this.shipmentsLoading) {
      this.loadShipments();
    }
  }

  // ── Shipments loader ─────────────────────────────────────────────────────
  loadShipments(): void {
    this.shipmentsLoading = true;
    this.shipmentsError   = '';

    const params: any = { page: this.shipmentsPage, limit: this.shipmentsLimit };
    if (this.shipmentsFilter) params.status = this.shipmentsFilter;

    this.shipmentService.getShipmentsByMerchant(this.merchantId, params).subscribe({
      next: (res) => {
        this.shipmentsTotal = res?.meta?.total ?? 0;
        this.shipments = (res?.data?.shipments ?? []).map((s: any) => ({
          id:        s._id,
          awb:       s.awb,
          date:      new Date(s.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status:    this.STATUS_LABELS[s.status] ?? s.status,
          rawStatus: s.status,
          dest:      `${s.destination?.city ?? '—'}, ${s.destination?.state ?? ''}`.replace(/,\s*$/, ''),
          amount:    s.merchantCost ?? 0,
          weight:    s.weight ?? 0,
          isCOD:     s.isCOD ?? false,
          cod:       s.codAmount ?? 0,
          carrier:   s.carrier ?? '—',
        }));
        this.shipmentsLoading = false;
      },
      error: (err) => {
        this.shipmentsError   = err?.error?.message || 'Failed to load shipments.';
        this.shipmentsLoading = false;
      },
    });
  }

  applyShipmentsFilter(): void {
    this.shipmentsPage = 1;
    this.shipments     = [];
    this.loadShipments();
  }

  prevShipmentsPage(): void {
    if (this.shipmentsPage > 1) {
      this.shipmentsPage--;
      this.shipments = [];
      this.loadShipments();
    }
  }

  nextShipmentsPage(): void {
    if (this.shipmentsPage < this.shipmentsTotalPages) {
      this.shipmentsPage++;
      this.shipments = [];
      this.loadShipments();
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  topupWallet(): void {
    this.router.navigate(['/distributor/merchant-finance/topup'], {
      queryParams: { merchantId: this.merchantId },
    });
  }

  viewMerchantWallet(): void {
    this.router.navigate(['/distributor/merchant-finance/transactions'], {
      queryParams: { merchantId: this.merchantId },
    });
  }

  suspendMerchant(): void {
    if (!confirm(`Suspend ${this.merchant.businessName}? They will not be able to log in.`)) return;
    this.isSaving = true;
    this.userService.deactivateUser(this.merchantId).subscribe({
      next: () => { this.merchant.status = 'Inactive'; this.isSaving = false; },
      error: (err) => { alert(err?.error?.message || 'Failed to suspend merchant.'); this.isSaving = false; },
    });
  }

  activateMerchant(): void {
    this.isSaving = true;
    this.userService.reactivateUser(this.merchantId).subscribe({
      next: () => { this.merchant.status = 'Active'; this.isSaving = false; },
      error: (err) => { alert(err?.error?.message || 'Failed to activate merchant.'); this.isSaving = false; },
    });
  }

  goBack(): void {
    this.router.navigate(['/distributor/merchants']);
  }
}
