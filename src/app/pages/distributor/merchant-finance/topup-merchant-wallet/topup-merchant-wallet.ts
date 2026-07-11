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
  isPreselected: boolean = false;
  amount: number | null = null;
  remarks: string = '';
  isSubmitting: boolean = false;
  isSuperAdminPortal: boolean = false;

  // Funding wallet balance (from API)
  distributorBalance: number = 0;

  merchants: any[] = [];
  selectedMerchant: any = null;

  quickAmounts = [1000, 5000, 10000, 25000, 50000];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.isSuperAdminPortal = this.router.url.startsWith('/super-admin');
    this.selectedMerchantId = this.route.snapshot.queryParams['merchantId'] || '';
    this.isPreselected = !!this.selectedMerchantId;
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
    if (this.isSuperAdminPortal) return false;
    return (this.amount || 0) > this.distributorBalance;
  }

  submitTopup() {
    if (!this.selectedMerchantId || !this.amount || this.amount <= 0) return;
    if (this.isInsufficient) return;

    this.isSubmitting = true;
    const request$ = this.isSuperAdminPortal
      ? this.financeService.topupWallet({
          userId: this.selectedMerchantId,
          amount: this.amount,
          note: this.remarks
        })
      : this.financeService.transferToMerchant({
          merchantId: this.selectedMerchantId,
          amount: this.amount,
          note: this.remarks
        });

    request$.subscribe({
      next: (res) => {
        const action = this.isSuperAdminPortal ? 'credited' : 'transferred';
        window.alert(`₹${this.amount} ${action} successfully to merchant wallet.`);
        this.isSubmitting = false;
        this.router.navigate([this.walletsRoute]);
      },
      error: (err) => {
        window.alert(err?.error?.message || 'Failed to fund merchant wallet. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate([this.walletsRoute]);
  }

  get fundingSourceLabel(): string {
    return this.isSuperAdminPortal ? 'Admin Top-up' : `Your Wallet (₹${this.distributorBalance.toLocaleString('en-IN')})`;
  }

  get submitLabel(): string {
    return this.isSuperAdminPortal ? 'Credit Funds' : 'Transfer Funds';
  }

  private get walletsRoute(): string {
    return this.isSuperAdminPortal ? '/super-admin/merchant-finance/wallets' : '/distributor/merchant-finance/wallets';
  }
}
