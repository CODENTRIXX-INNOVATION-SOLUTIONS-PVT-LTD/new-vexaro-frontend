import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-distributor-merchant-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-profile.html',
  styleUrl: './merchant-profile.css'
})
export class DistributorMerchantProfile implements OnInit {
  merchantId: string = '';
  activeTab: string = 'overview';
  isLoading: boolean = false;
  isSaving: boolean = false;

  merchant = {
    merchantCode: '',
    businessName: '',
    displayName: '',
    contactPerson: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    pan: '',
    warehouseId: '',
    walletBalance: 0,
    creditLimit: 0,
    paymentTerms: '',
    totalShipments: 0,
    deliveredShipments: 0,
    status: 'Active'
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.merchantId = this.route.snapshot.paramMap.get('id') || '';
    this.loadMerchant();
  }

  loadMerchant() {
    this.isLoading = true;
    // TODO: API Call → GET /distributor/:dId/merchants/:merchantId
    this.isLoading = false;
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  viewMerchantWallet() {
    this.router.navigate(['/distributor/merchants', this.merchantId, 'wallet']);
  }

  viewMerchantShipments() {
    this.router.navigate(['/distributor/merchants', this.merchantId, 'shipments']);
  }

  topupWallet() {
    this.router.navigate(['/distributor/merchant-finance/topup'], {
      queryParams: { merchantId: this.merchantId }
    });
  }

  suspendMerchant() {
    if (confirm(`Are you sure you want to suspend ${this.merchant.businessName}?`)) {
      // TODO: PUT /distributor/:dId/merchants/:merchantId/status { status: 'Suspended' }
      this.merchant.status = 'Suspended';
    }
  }

  activateMerchant() {
    // TODO: PUT /distributor/:dId/merchants/:merchantId/status { status: 'Active' }
    this.merchant.status = 'Active';
  }

  goBack() {
    this.router.navigate(['/distributor/merchants']);
  }
}
