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
    this.merchantWallets = [
      { id: 'M1', businessName: 'ABC Electronics', merchantCode: 'MER001', balance: 12400, codEscrow: 4500, status: 'Active' },
      { id: 'M2', businessName: 'Global Traders', merchantCode: 'MER002', balance: 45000, codEscrow: 12000, status: 'Active' },
      { id: 'M3', businessName: 'Prime Retail', merchantCode: 'MER003', balance: 3500, codEscrow: 0, status: 'Active' },
      { id: 'M4', businessName: 'Mega Store', merchantCode: 'MER004', balance: 0, codEscrow: 1800, status: 'Suspended' }
    ];
    this.totalDistributed = this.merchantWallets.reduce((s, w) => s + w.balance, 0);
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
