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
  imports: [CommonModule, FormsModule, RouterLink, MerchantApiKeys, MerchantDocuments, MerchantInvoices, MerchantPayments, MerchantShipments],
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
    id: 0,
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

    status: 'Active',
    distributorName: '',
    distributorId: 0,
    warehouseDetails: '',
    registrationDate: ''
  };

  stats = {
    totalOrders: 1250,
    deliveredOrders: 980,
    cancelledOrders: 45,
    inTransitOrders: 205,
    reversePickups: 15,
    weightDisputes: 5
  };

  trackingData = [
    {
      awbNumber: 'AWB-88291029',
      courierPartner: 'Delhivery',
      trackingStatus: 'In Transit',
      deliveryStatus: 'Out for Delivery',
      destination: 'Mumbai',
      date: '17 Jun 2026'
    },
    {
      awbNumber: 'AWB-77182910',
      courierPartner: 'Blue Dart',
      trackingStatus: 'Delivered',
      deliveryStatus: 'Delivered',
      destination: 'Delhi',
      date: '16 Jun 2026'
    },
    {
      awbNumber: 'AWB-66281920',
      courierPartner: 'Xpressbees',
      trackingStatus: 'Pending',
      deliveryStatus: 'Pickup Scheduled',
      destination: 'Bangalore',
      date: '17 Jun 2026'
    },
    {
      awbNumber: 'AWB-55172819',
      courierPartner: 'Shadowfax',
      trackingStatus: 'Cancelled',
      deliveryStatus: 'Returned to Origin',
      destination: 'Pune',
      date: '15 Jun 2026'
    }
  ];

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
      id: this.merchantId,
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

      status: 'Active',
      distributorName: 'Express Distributors Ltd',
      distributorId: 1,
      warehouseDetails: 'Central Warehouse - Hub A',
      registrationDate: '12 Jan 2025'
    };
  }

  updatemMrchant() {

    console.log(this.merchant);

    // API Call Here

    alert('Merchant Updated Successfully');
  }
}