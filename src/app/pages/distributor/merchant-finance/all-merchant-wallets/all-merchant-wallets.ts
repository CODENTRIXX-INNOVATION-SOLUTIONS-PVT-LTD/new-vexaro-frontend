import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';

@Component({
  selector: 'app-all-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-merchant-wallets.html',
  styleUrl: './all-merchant-wallets.css'
})
export class AllMerchantWallets implements OnInit {
  merchantWallets: any[] = [];
  filteredWallets: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  totalDistributed: number = 0;

  constructor(private router: Router, private financeService: FinanceService) {}

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.isLoading = true;
    this.financeService.listWallets().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.wallets) {
          this.merchantWallets = response.data.wallets.map((w: any) => ({
            id: w.userId || w.id,
            businessName: w.businessName || w.name,
            merchantCode: w.merchantCode || `MRC-${w.id}`,
            balance: w.balance || 0,
            codEscrow: w.codEscrow || 0,
            status: w.status || 'Active'
          }));
          this.totalDistributed = this.merchantWallets.reduce((s, w) => s + w.balance, 0);
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading merchant wallets:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredWallets = this.merchantWallets.filter(w =>
      w.businessName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      w.merchantCode?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  topupMerchant(merchantId: string) {
    this.router.navigate(['/distributor/merchant-finance/topup'], {
      queryParams: { merchantId }
    });
  }

  viewTransactions(merchantId: string) {
    this.router.navigate(['/distributor/merchant-finance/transactions'], {
      queryParams: { merchantId }
    });
  }

  viewMerchant(merchantId: string) {
    this.router.navigate(['/distributor/merchants', merchantId]);
  }
}
