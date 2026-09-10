import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DistributorMerchants } from '../distributor-merchants/distributor-merchants';
import { DistributorPayments } from '../distributor-payments/distributor-payments';
import { DistributorPerformance } from '../distributor-performance/distributor-performance';
import { DistributorShipments } from '../distributor-shipments/distributor-shipments';
import { UserService } from '../../../../services/user.service';

// The shape the HTML template binds to — only fields available in backend
interface DistributorViewModel {
  distributorName: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
}

function toViewModel(user: any): DistributorViewModel {
  const w = user.warehouse;
  let status = user.isActive ? 'Active' : 'Inactive';

  // Determine if user is not activated
  const isNotActivated = user.mustChangeCredentials || !user.lastLoginAt;

  if (isNotActivated) {
    if (user.mustChangeCredentials) {
      status = 'Not Set Password';
    } else if (!user.lastLoginAt) {
      status = 'Not Activated';
    }
  }

  return {
    distributorName: user.companyName || `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || '—',
    address: user.address || '—',
    contactPerson: `${user.firstName} ${user.lastName}`,
    contactPhone: user.phone || '—',
    contactEmail: user.email,
    status: status,
  };
}

@Component({
  selector: 'app-update-distributor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    DistributorMerchants, DistributorPayments,
    DistributorPerformance, DistributorShipments,
  ],
  templateUrl: './distributor-profile.html',
  styleUrl: './distributor-profile.css'
})
export class DistributorProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  activeTab = 'merchants';
  distributorId!: string;

  isLoading = signal(true);
  errorMessage = signal('');
  isResending = signal(false);

  // Initialised blank so template bindings never throw before data arrives
  distributor: DistributorViewModel = {
    distributorName: '', email: '', phone: '',
    address: '', contactPerson: '', contactPhone: '', contactEmail: '',
    status: 'Active',
  };

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.distributorId) {
      this.router.navigate(['/super-admin/distributors']);
      return;
    }

    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    if (requestedTab) {
      const validTabs = ['profile', 'merchants', 'warehouses', 'shipments', 'performance', 'payments'];
      if (validTabs.includes(requestedTab)) {
        this.activeTab = requestedTab;
      }
    }

    this.loadDistributor();
  }

  loadDistributor(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getUserById(this.distributorId).subscribe({
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
    const isActive = this.distributor.status === 'Active';
    const request = this.userService.updateUserStatus(this.distributorId, !isActive);

    request.subscribe({
      next: () => {
        this.loadDistributor();
        alert(`Distributor ${isActive ? 'Deactivated' : 'Activated'} successfully.`);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to update distributor status.'
        );
      },
    });
  }

  deleteDistributor(): void {
    const confirmed = window.confirm(
      `Delete distributor "${this.distributor.distributorName}"? This will disable the distributor portal and also delete merchants under this distributor. This action cannot be undone.`
    );
    if (!confirmed) return;

    this.userService.deactivateUser(this.distributorId).subscribe({
      next: () => {
        alert('Distributor deleted successfully');
        this.router.navigate(['/super-admin/distributors']);
      },
      error: (err) => {
        alert(`Failed to delete distributor: ${err?.error?.message || 'Unknown error'}`);
      },
    });
  }

  isNotActivated(): boolean {
    return this.distributor.status === 'Not Set Password' || this.distributor.status === 'Not Activated';
  }

  resendInvitation(): void {
    this.isResending.set(true);

    this.userService.resendInvite(this.distributorId).subscribe({
      next: () => {
        this.isResending.set(false);
        alert('Invitation resent successfully to ' + this.distributor.email);
        this.loadDistributor();
      },
      error: (err) => {
        this.isResending.set(false);
        alert(`Failed to resend invitation: ${err?.error?.message || 'Unknown error'}`);
      }
    });
  }

  assignWarehouse(): void { alert('Assign Warehouse feature coming soon'); }
  generateLogin(): void { alert('Generate Login feature coming soon'); }
  updateDistributor(): void {
    console.log(this.distributor);
    alert('Distributor Updated Successfully');
  }
}
