import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

export interface DistributorMerchant {
  id: string;
  merchantCode: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  warehouseId: string;
  walletBalance: number;
  totalShipments: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

@Component({
  selector: 'app-distributor-merchant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-list.html',
  styleUrl: './merchant-list.css'
})
export class DistributorMerchantList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  merchants: DistributorMerchant[] = [];
  filteredMerchants: DistributorMerchant[] = [];
  searchTerm: string = '';
  statusFilter: string = 'All';
  isLoading: boolean = false;
  errorMessage: string = '';
  viewMode: 'table' | 'grid' = 'grid';

  constructor(
    private router: Router,
    private merchantService: MerchantService,
  ) {}

  ngOnInit() {
    this.loadMerchants();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMerchants() {
    this.isLoading = true;
    this.errorMessage = '';

    this.merchantService.listMerchants({ limit: 100 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.merchants = res.data.users.map((merchant) => this.toDistributorMerchant(merchant));
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.merchants = [];
        this.filteredMerchants = [];
        this.errorMessage = err?.error?.message || 'Failed to load merchants. Please try again.';
        this.isLoading = false;
        this.applyFilters();
      },
    });
  }

  applyFilters() {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredMerchants = this.merchants.filter(m => {
      const matchesSearch =
        !search ||
        m.businessName.toLowerCase().includes(search) ||
        m.merchantCode.toLowerCase().includes(search) ||
        m.contactPerson.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.phone.includes(this.searchTerm.trim());
      const matchesStatus = this.statusFilter === 'All' || m.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  viewMerchant(id: string) {
    this.router.navigate(['/distributor/merchants', id]);
  }

  createMerchant() {
    this.router.navigate(['/distributor/merchants/create']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Suspended': return 'status-suspended';
      default: return '';
    }
  }

  setViewMode(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  private toDistributorMerchant(merchant: MerchantUser): DistributorMerchant {
    const fullName = `${merchant.firstName || ''} ${merchant.lastName || ''}`.trim();
    const warehouse = merchant.warehouse;

    return {
      id: merchant.id,
      merchantCode: merchant.id ? `MRC-${merchant.id.slice(-6).toUpperCase()}` : 'MRC',
      businessName: merchant.companyName || fullName || merchant.email,
      contactPerson: fullName || merchant.email,
      phone: merchant.phone || '',
      email: merchant.email,
      city: warehouse?.city || '',
      warehouseId: warehouse?.warehouseId || '',
      walletBalance: 0,
      totalShipments: 0,
      status: merchant.isActive ? 'Active' : 'Inactive',
      createdAt: merchant.createdAt,
    };
  }
}
