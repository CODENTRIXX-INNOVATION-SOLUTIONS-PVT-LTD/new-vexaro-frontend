import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MerchantApiKeys } from '../merchant-api-keys/merchant-api-keys';
import { MerchantDocuments } from '../merchant-documents/merchant-documents';
import { MerchantInvoices } from '../merchant-invoices/merchant-invoices';
import { MerchantPayments } from '../merchant-payments/merchant-payments';
import { MerchantShipments } from '../merchant-shipments/merchant-shipments';



@Component({
  selector: 'app-update-merchant',
  standalone: true,
  imports: [   CommonModule,FormsModule, RouterLink, MerchantApiKeys, MerchantDocuments, MerchantInvoices, MerchantPayments, MerchantShipments],
  templateUrl: './merchant-profile.html',
  styleUrl: './merchant-profile.css'
})
export class MerchantProfile implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) { }
  activeTab: string = 'profile';

  changeTab(tab: string) {
    this.activeTab = tab;
  }
  merchantId!: number;

  merchant = {
    merchantName: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    city: '',
    state: '',
    pincode: '',

    contactPerson: '',
    contactPhone: '',
    contactEmail: '',

    gstNumber: '',
    panNumber: '',
    paymentTerms: '15 Days',
    creditLimit: 0,

    status: 'Active'
  };

  assignWarehouse() {
    alert('Assign Warehouse feature coming soon');
  }

  generateLogin() {
    alert('Generate Login feature coming soon');
  }

  toggleStatus() {

    this.merchant.status =
      this.merchant.status === 'Active'
        ? 'Inactive'
        : 'Active';

    alert(
      `merchant ${this.merchant.status === 'Active'
        ? 'Activated'
        : 'Deactivated'
      } Successfully`
    );
  }



  ngOnInit(): void {
    this.merchantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadMerchant();
  }

  loadMerchant() {

    // Dummy Data

    this.merchant = {
      merchantName: 'SpeedLink merchants',
      displayName: 'SpeedLink',

      email: 'contact@speedlink.com',
      phone: '9876543210',

      address: '123 Logistic Park, Andheri East',
      region: 'West Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',

      contactPerson: 'Rajesh Mehta',
      contactPhone: '9876543210',
      contactEmail: 'rajesh@speedlink.com',

      gstNumber: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      paymentTerms: '15 Days',
      creditLimit: 100000,

      status: 'Active'
    };
  }

  updatemMrchant() {

    console.log(this.merchant);

    // API Call Here

    alert('Merchant Updated Successfully');
  }
}