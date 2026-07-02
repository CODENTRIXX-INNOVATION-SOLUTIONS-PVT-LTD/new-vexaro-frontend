import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';
import { UserService } from '../../../../services/user.service';

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

  constructor(private route: ActivatedRoute, private router: Router, private financeService: FinanceService, private userService: UserService) {}

  ngOnInit() {
    this.selectedMerchantId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadData();
  }

  loadData() {
    // Load distributor balance
    this.financeService.getMyWallet().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.distributorBalance = response.data.balance || 0;
        }
      },
      error: (error) => {
        console.error('Error loading distributor balance:', error);
      }
    });

    // Load merchants for dropdown
    this.userService.listUsers({ role: 'MERCHANT' }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.users) {
          this.merchants = response.data.users.map((u: any) => ({
            id: u.id,
            businessName: u.businessName || u.name,
            merchantCode: u.merchantCode || `MRC-${u.id}`,
            balance: u.walletBalance || 0
          }));
          if (this.selectedMerchantId) {
            this.onMerchantChange();
          }
        }
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
      }
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
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(['/distributor/merchant-finance/wallets']);
      },
      error: (error) => {
        console.error('Error topping up merchant wallet:', error);
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/distributor/merchant-finance/wallets']);
  }
}
