import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

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
  imports: [CommonModule],
  templateUrl: './distributor-merchants.html',

  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorMerchants implements OnInit {
  distributorId = '';
  merchants: DistributorMerchant[] = [];
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private merchantService: MerchantService,
  ) { }

  ngOnInit(): void {
    const currentId = this.route.snapshot.paramMap.get('id');
    const parentId = this.route.parent?.snapshot.paramMap.get('id');
    this.distributorId = currentId ?? parentId ?? '';

    if (!this.distributorId) {
      this.error = 'Distributor not found.';
      return;
    }
    this.loadMerchants();
  }

  private userBelongsToDistributor(user: MerchantUser): boolean {
    const invitedBy = user.invitedBy as any;
    if (!invitedBy) return false;
    if (typeof invitedBy === 'string') {
      return invitedBy === this.distributorId;
    }
    return invitedBy._id?.toString?.() === this.distributorId;
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
    this.isLoading = true;
    this.error = '';

    this.merchantService.listMerchants({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.merchants = (res.data.users ?? [])
          .filter((user) => this.userBelongsToDistributor(user))
          .map((user) => this.mapMerchant(user));
        console.log('Merchants loaded:', this.merchants);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Failed to load merchants.';
      },
    });
  }
}
