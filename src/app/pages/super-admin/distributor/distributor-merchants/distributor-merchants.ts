import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';
import { UserService } from '../../../../services/user.service';

interface DistributorMerchant {
  id: string;
  name: string;
  owner: string;
  city: string;
  orders: string | number;
  status: string;
}

@Component({
  selector: 'app-distributor-merchants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distributor-merchants.html',

  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorMerchants {
  distributorId = input.required<string>();
  merchants: DistributorMerchant[] = [];
  isLoading = signal(false);
  error = signal('');

  constructor(
    private merchantService: MerchantService,
    private userService: UserService,
  ) {
    // Use setTimeout to ensure input is bound before loading
    setTimeout(() => {
      this.loadMerchants();
    }, 0);
  }

  private userBelongsToDistributor(user: MerchantUser): boolean {
    const invitedBy = user.invitedBy as any;
    const currentDistributorId = this.distributorId();

    if (!invitedBy) return false;
    if (typeof invitedBy === 'string') {
      return invitedBy === currentDistributorId;
    }
    return invitedBy._id?.toString?.() === currentDistributorId;
  }

  private mapMerchant(user: MerchantUser): DistributorMerchant {
    return {
      id: user.id,
      name: user.companyName || `${user.firstName} ${user.lastName}`,
      owner: `${user.firstName} ${user.lastName}`,
      city: '—',
      orders: '—',
      status: user.isActive ? 'Active' : 'Inactive',
    };
  }

  loadMerchants(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.merchantService.listMerchants({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.merchants = (res.data.users ?? [])
          .filter((user) => this.userBelongsToDistributor(user))
          .map((user) => this.mapMerchant(user));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || 'Failed to load merchants.');
      },
    });
  }

  toggleMerchantStatus(merchant: DistributorMerchant): void {
    const newStatus = merchant.status === 'Active' ? false : true;
    const statusText = newStatus ? 'Activated' : 'Deactivated';

    this.userService.updateUserStatus(merchant.id, newStatus).subscribe({
      next: () => {
        merchant.status = newStatus ? 'Active' : 'Inactive';
        alert(`Merchant ${statusText} successfully`);
      },
      error: (err) => {
        alert(`Failed to ${statusText.toLowerCase()} merchant: ${err?.error?.message || 'Unknown error'}`);
      },
    });
  }
}
