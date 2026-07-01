import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DistributorMerchants } from '../distributor-merchants/distributor-merchants';
import { DistributorPayments } from '../distributor-payments/distributor-payments';
import { DistributorPerformance } from '../distributor-performance/distributor-performance';
import { DistributorShipments } from '../distributor-shipments/distributor-shipments';
import { DistributorWarehouses } from '../distributor-warehouses/distributor-warehouses';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

// The shape the HTML template already binds to — kept identical so the template
// needs zero changes. Fields absent from the DB are filled with '—'.
interface DistributorViewModel {
  distributorName: string;
  displayName:     string;
  email:           string;
  phone:           string;
  address:         string;
  region:          string;
  city:            string;
  state:           string;
  pincode:         string;
  contactPerson:   string;
  contactPhone:    string;
  contactEmail:    string;
  gstNumber:       string;
  panNumber:       string;
  paymentTerms:    string;
  creditLimit:     string | number;
  status:          string;
}

function toViewModel(user: MerchantUser): DistributorViewModel {
  return {
    // companyName is the closest field to "distributor name"
    distributorName: user.companyName || `${user.firstName} ${user.lastName}`,
    displayName:     user.companyName || '—',
    email:           user.email,
    phone:           user.phone    || '—',
    address:         user.address  || '—',
    // No region/city/state/pincode at the top-level user document for distributors
    // (warehouse is only on MERCHANTs). Show '—' for missing structured fields.
    region:          '—',
    city:            '—',
    state:           '—',
    pincode:         '—',
    // contact details — distributor has no separate contact sub-document
    contactPerson:   `${user.firstName} ${user.lastName}`,
    contactPhone:    user.phone || '—',
    contactEmail:    user.email,
    // No GST/PAN/payment terms/credit limit columns on the user model
    gstNumber:       '—',
    panNumber:       '—',
    paymentTerms:    '—',
    creditLimit:     '—',
    status:          user.isActive ? 'Active' : 'Inactive',
  };
}

@Component({
  selector: 'app-update-distributor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    DistributorMerchants, DistributorPayments,
    DistributorPerformance, DistributorShipments, DistributorWarehouses,
  ],
  templateUrl: './distributor-profile.html',
  styleUrl: './distributor-profile.css'
})
export class DistributorProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private merchantService = inject(MerchantService);

  activeTab = 'profile';
  distributorId!: string;

  isLoading = signal(true);
  errorMessage = signal('');

  // Initialised blank so template bindings never throw before data arrives
  distributor: DistributorViewModel = {
    distributorName: '', displayName: '', email: '', phone: '',
    address: '', region: '', city: '', state: '', pincode: '',
    contactPerson: '', contactPhone: '', contactEmail: '',
    gstNumber: '', panNumber: '', paymentTerms: '', creditLimit: '',
    status: 'Active',
  };

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.distributorId) {
      this.router.navigate(['/super-admin/distributors']);
      return;
    }
    this.loadDistributor();
  }

  loadDistributor(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.merchantService.getDistributorById(this.distributorId).subscribe({
      next: (res) => {
        this.distributor = toViewModel(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load distributor profile.'
        );
        this.isLoading.set(false);
      },
    });
  }

  changeTab(tab: string): void { this.activeTab = tab; }

  toggleStatus(): void {
    this.distributor.status = this.distributor.status === 'Active' ? 'Inactive' : 'Active';
    alert(`Distributor ${this.distributor.status === 'Active' ? 'Activated' : 'Deactivated'} Successfully`);
  }

  assignWarehouse(): void  { alert('Assign Warehouse feature coming soon'); }
  generateLogin(): void    { alert('Generate Login feature coming soon'); }
  updateDistributor(): void {
    console.log(this.distributor);
    alert('Distributor Updated Successfully');
  }
}
