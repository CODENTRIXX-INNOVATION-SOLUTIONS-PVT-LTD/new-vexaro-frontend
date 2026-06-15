import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './merchant-list.html',
  styleUrl: './merchant-list.css'
})
export class Merchant {

  constructor(private router: Router) {}

  activeMenu: number | null = null;

  toggleMenu(id: number) {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  viewMerchant(id: number) {
    this.router.navigate(['/super-admin/merchants/profile', id]);
  }

  merchants = [
    {
      id: 1,
      companyName: 'ABC Electronics',
      contactPerson: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul@abcelectronics.com',
      gst: '23ABCDE1234F1Z5',
      status: 'Active'
    },
    {
      id: 2,
      companyName: 'Global Traders',
      contactPerson: 'Amit Verma',
      mobile: '9123456780',
      email: 'amit@globaltraders.com',
      gst: '23XYZAB1234P1Z8',
      status: 'Active'
    },
    {
      id: 3,
      companyName: 'Prime Retail',
      contactPerson: 'Neha Singh',
      mobile: '9988776655',
      email: 'neha@primeretail.com',
      gst: '23PQRSX5678K1Z3',
      status: 'Inactive'
    },
    {
      id: 4,
      companyName: 'Mega Store',
      contactPerson: 'Vijay Patel',
      mobile: '9871234567',
      email: 'vijay@megastore.com',
      gst: '23QWER1234T1Z9',
      status: 'Active'
    }
  ];

}