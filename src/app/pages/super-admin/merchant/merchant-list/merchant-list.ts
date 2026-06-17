import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './merchant-list.html',
  styleUrl: './merchant-list.css'
})
export class Merchant {

  constructor(private router: Router) {}

  activeMenu: number | null = null;
  searchQuery: string = '';
  statusFilter: string = 'All';

  toggleMenu(id: number) {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  viewMerchant(id: number) {
    this.router.navigate(['/super-admin/merchants/profile', id]);
  }

  getInitials(name: string): string {
    if (!name) return 'M';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  get totalMerchants() {
    return this.merchants.length;
  }

  get activeMerchants() {
    return this.merchants.filter(m => m.status === 'Active').length;
  }

  get inactiveMerchants() {
    return this.merchants.filter(m => m.status === 'Inactive').length;
  }

  get filteredMerchants() {
    return this.merchants.filter(m => {
      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        m.companyName.toLowerCase().includes(query) ||
        m.contactPerson.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.mobile.includes(query) ||
        m.distributorName.toLowerCase().includes(query);
      
      const matchesStatus = this.statusFilter === 'All' || m.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  merchants = [
    {
      id: 1,
      companyName: 'ABC Electronics',
      contactPerson: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul@abcelectronics.com',
      gst: '23ABCDE1234F1Z5',
      status: 'Active',
      distributorName: 'Express Distributors Ltd',
      distributorId: 1
    },
    {
      id: 2,
      companyName: 'Global Traders',
      contactPerson: 'Amit Verma',
      mobile: '9123456780',
      email: 'amit@globaltraders.com',
      gst: '23XYZAB1234P1Z8',
      status: 'Active',
      distributorName: 'Rapid Delivery Services',
      distributorId: 2
    },
    {
      id: 3,
      companyName: 'Prime Retail',
      contactPerson: 'Neha Singh',
      mobile: '9988776655',
      email: 'neha@primeretail.com',
      gst: '23PQRSX5678K1Z3',
      status: 'Inactive',
      distributorName: 'Express Distributors Ltd',
      distributorId: 1
    },
    {
      id: 4,
      companyName: 'Mega Store',
      contactPerson: 'Vijay Patel',
      mobile: '9871234567',
      email: 'vijay@megastore.com',
      gst: '23QWER1234T1Z9',
      status: 'Active',
      distributorName: 'Logistics Pro Solutions',
      distributorId: 3
    }
  ];

}