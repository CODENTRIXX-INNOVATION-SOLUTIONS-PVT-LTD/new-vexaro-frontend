import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';

@Component({
  selector: 'app-topup-merchant-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topup-merchant-wallet.html',
  styleUrl: './topup-merchant-wallet.css'
})
export class TopupMerchantWallet implements OnInit {
  private financeService = inject(FinanceService);

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
    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        this.distributorBalance = res?.data?.balance ?? 0;
      },
      error: (err) => console.error('Failed to load distributor wallet:', err)
    });

    this.financeService.listWallets({ limit: 100 }).subscribe({
      next: (res) => {
        this.merchants = (res?.data?.wallets || [])
          .filter((w: any) => w.userId?.role === 'MERCHANT')
          .map((w: any) => ({
            id: w.userId?._id,
            businessName: w.userId?.companyName || w.userId?.firstName || 'Unknown',
            merchantCode: w.userId?.merchantCode || '—',
            walletBalance: w.balance || 0
          }));
        if (this.selectedMerchantId) {
          this.onMerchantChange();
        }
      },
      error: (err) => console.error('Failed to load merchants:', err)
    });
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
    this.financeService.transferToMerchant({
      merchantId: this.selectedMerchantId,
      amount: this.amount,
      note: this.remarks
    }).subscribe({
      next: (res) => {
        alert(`₹${this.amount} transferred successfully to merchant wallet.`);
        this.isSubmitting = false;
        this.router.navigate(['/distributor/merchant-finance/wallets']);
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to transfer funds. Please check your balance and try again.');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/distributor/merchant-finance/wallets']);
  }
}
