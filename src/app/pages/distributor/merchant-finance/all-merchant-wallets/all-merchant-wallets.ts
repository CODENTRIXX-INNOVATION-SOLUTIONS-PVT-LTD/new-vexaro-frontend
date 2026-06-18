import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/merchant-wallets
    this.isLoading = false;
    this.applyFilters();
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
