import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';

@Component({
  selector: 'app-all-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-merchant-wallets.html',
  styleUrl: './all-merchant-wallets.css',
})
export class AllMerchantWallets implements OnInit {
  private financeService = inject(FinanceService);

  merchantWallets: any[] = [];
  filteredWallets: any[] = [];
  searchTerm = '';
  isLoading = false;
  totalBalance = 0;

  constructor(private router: Router) {}

  ngOnInit() { this.loadWallets(); }

  loadWallets() {
    this.isLoading = true;
    this.financeService.listWallets({ limit: 200 }).subscribe({
      next: (res) => {
        const all: any[] = res?.data?.wallets ?? [];
        this.merchantWallets = all
          .filter((w: any) => w.userId?.role === 'MERCHANT')
          .map((w: any) => ({
            id: w.userId?._id ?? w._id,
            businessName: w.userId?.companyName ?? w.userId?.firstName ?? 'Unknown',
            merchantCode: w.userId?.merchantCode ?? w.userId?._id?.slice(-6)?.toUpperCase() ?? '—',
            balance: w.balance ?? 0,
            codEscrow: w.codEscrowBalance ?? 0,
            status: w.isActive === false ? 'Suspended' : 'Active',
            email: w.userId?.email ?? '—',
          }));
        this.totalBalance = this.merchantWallets.reduce((s, w) => s + w.balance, 0);
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load merchant wallets', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    const q = this.searchTerm.toLowerCase();
    this.filteredWallets = q
      ? this.merchantWallets.filter(
          w => w.businessName.toLowerCase().includes(q) || w.merchantCode.toLowerCase().includes(q) || w.email.toLowerCase().includes(q),
        )
      : [...this.merchantWallets];
  }

  topupMerchant(merchantId: string) {
    this.router.navigate(['/distributor/merchant-finance/topup'], { queryParams: { merchantId } });
  }

  viewTransactions(merchantId: string) {
    this.router.navigate(['/distributor/merchant-finance/transactions'], { queryParams: { merchantId } });
  }

  viewMerchant(merchantId: string) {
    this.router.navigate(['/distributor/merchants', merchantId]);
  }
}
