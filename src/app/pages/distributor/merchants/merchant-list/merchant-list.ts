import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants() {
    this.isLoading = true;
    // Mocking real-world load with dummy data for UI display
    setTimeout(() => {
      this.merchants = [
        { id: '1', merchantCode: 'MRC-1001', businessName: 'Fashion Hub Pvt Ltd', contactPerson: 'Ramesh Sharma', phone: '9876543210', email: 'ramesh@fashionhub.com', city: 'Mumbai', warehouseId: 'WH-001', walletBalance: 45000, totalShipments: 1250, status: 'Active', createdAt: '2026-01-15' },
        { id: '2', merchantCode: 'MRC-1002', businessName: 'Tech Electro', contactPerson: 'Suresh Patil', phone: '9876543211', email: 'suresh@techelectro.in', city: 'Pune', warehouseId: 'WH-002', walletBalance: 12500, totalShipments: 420, status: 'Active', createdAt: '2026-02-20' },
        { id: '3', merchantCode: 'MRC-1003', businessName: 'Organic Grocers', contactPerson: 'Anita Desai', phone: '9876543212', email: 'anita@organicgrocers.com', city: 'Delhi', warehouseId: 'WH-003', walletBalance: 0, totalShipments: 50, status: 'Inactive', createdAt: '2026-05-10' },
        { id: '4', merchantCode: 'MRC-1004', businessName: 'Sneaker World', contactPerson: 'Karan Singh', phone: '9876543213', email: 'karan@sneakerworld.in', city: 'Bangalore', warehouseId: 'WH-004', walletBalance: -500, totalShipments: 320, status: 'Suspended', createdAt: '2026-03-05' }
      ];
      this.isLoading = false;
      this.applyFilters();
    }, 800);
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
