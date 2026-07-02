import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

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
export class DistributorMerchantList implements OnInit {
  merchants: DistributorMerchant[] = [];
  filteredMerchants: DistributorMerchant[] = [];
  searchTerm: string = '';
  statusFilter: string = 'All';
  isLoading: boolean = false;
  viewMode: 'table' | 'grid' = 'grid';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants() {
    this.isLoading = true;
    this.userService.listUsers({ role: 'MERCHANT' }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.users) {
          this.merchants = response.data.users.map((user: any) => ({
            id: user.id,
            merchantCode: `MRC-${user.id.substring(0, 8).toUpperCase()}`,
            businessName: user.companyName || `${user.firstName} ${user.lastName}`,
            contactPerson: `${user.firstName} ${user.lastName}`,
            phone: user.phone || '',
            email: user.email || '',
            city: user.address || '',
            warehouseId: user.warehouse?.warehouseId || '',
            walletBalance: 0, // TODO: Fetch from wallet API if needed
            totalShipments: 0, // TODO: Fetch from shipments API if needed
            status: user.isActive ? 'Active' : 'Inactive',
            createdAt: user.createdAt || ''
          }));
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredMerchants = this.merchants.filter(m => {
      const matchesSearch =
        m.businessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.merchantCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.phone.includes(this.searchTerm);
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
}
