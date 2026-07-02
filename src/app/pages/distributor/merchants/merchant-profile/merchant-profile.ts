import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../services/user.service';

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

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.merchantId = this.route.snapshot.paramMap.get('id') || '';
    this.loadMerchant();
  }

  loadMerchant() {
    this.isLoading = true;
    this.userService.getUserById(this.merchantId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const user = response.data;
          this.merchant = {
            merchantCode: user.merchantCode || `MRC-${user.id}`,
            businessName: user.businessName || user.name,
            displayName: user.displayName || user.name,
            contactPerson: user.contactPerson || user.name,
            phone: user.phone || '',
            email: user.email || '',
            addressLine1: user.addressLine1 || '',
            city: user.city || '',
            state: user.state || '',
            pincode: user.pincode || '',
            gstin: user.gstin || '',
            pan: user.pan || '',
            warehouseId: user.warehouseId || '',
            walletBalance: user.walletBalance || 0,
            creditLimit: user.creditLimit || 0,
            paymentTerms: user.paymentTerms || '',
            totalShipments: user.totalShipments || 0,
            deliveredShipments: user.deliveredShipments || 0,
            status: user.status || 'Active'
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading merchant:', error);
        this.isLoading = false;
      }
    });
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
    if (confirm(`Are you sure you want to suspend ${this.merchant.businessName}? This will prevent them from booking new shipments.`)) {
      this.isSaving = true;
      this.userService.updateUser(this.merchantId, { status: 'Suspended' }).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          this.merchant.status = 'Suspended';
          alert('Merchant suspended successfully!');
        },
        error: (error: any) => {
          this.isSaving = false;
          alert(error.error?.message || 'Failed to suspend merchant. Please try again.');
        }
      });
    }
  }

  activateMerchant() {
    if (confirm(`Are you sure you want to activate ${this.merchant.businessName}?`)) {
      this.isSaving = true;
      this.userService.updateUser(this.merchantId, { status: 'Active' }).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          this.merchant.status = 'Active';
          alert('Merchant activated successfully!');
        },
        error: (error: any) => {
          this.isSaving = false;
          alert(error.error?.message || 'Failed to activate merchant. Please try again.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/distributor/merchants']);
  }
}
