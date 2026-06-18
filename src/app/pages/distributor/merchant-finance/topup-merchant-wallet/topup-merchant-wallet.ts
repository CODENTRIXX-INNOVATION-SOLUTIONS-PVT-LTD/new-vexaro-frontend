import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-topup-merchant-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topup-merchant-wallet.html',
  styleUrl: './topup-merchant-wallet.css'
})
export class TopupMerchantWallet implements OnInit {
  selectedMerchantId: string = '';
  amount: number | null = null;
  remarks: string = '';
  isSubmitting: boolean = false;

  // Distributor wallet balance (from API)
  distributorBalance: number = 0;

  merchants: any[] = [];
  selectedMerchant: any = null;

  quickAmounts = [1000, 5000, 10000, 25000, 50000];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.selectedMerchantId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadData();
  }

  loadData() {
    // TODO: GET /distributor/:id/merchants (for dropdown)
    // TODO: GET /wallet/distributor/:id (for balance check)
    if (this.selectedMerchantId) {
      this.onMerchantChange();
    }
  }

  onMerchantChange() {
    this.selectedMerchant = this.merchants.find(m => m.id === this.selectedMerchantId) || null;
  }

  setQuickAmount(amt: number) {
    this.amount = amt;
  }

  get isInsufficient(): boolean {
    return (this.amount || 0) > this.distributorBalance;
  }

  submitTopup() {
    if (!this.selectedMerchantId || !this.amount || this.amount <= 0) return;
    if (this.isInsufficient) return;

    this.isSubmitting = true;
    // TODO: POST /wallet/merchant/:merchantId/topup
    // Body: { amount, remarks, distributorId }
    // This deducts from distributor wallet and credits merchant wallet atomically
    console.log('Topup:', { merchantId: this.selectedMerchantId, amount: this.amount, remarks: this.remarks });
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/distributor/merchant-finance/wallets']);
    }, 1500);
  }

  cancel() {
    this.router.navigate(['/distributor/merchant-finance/wallets']);
  }
}
