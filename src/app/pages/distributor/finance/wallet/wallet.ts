import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../../services/finance.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {
  private financeService = inject(FinanceService);

  balance: number = 0;
  lockedFunds: number = 0;
  transactions: any[] = [];
  isLoading: boolean = false;

  isTopupModalOpen: boolean = false;
  paymentMethod: 'checkout' | 'upi_qr' = 'checkout';
  topupAmount: number = 0;
  isPaymentProcessing: boolean = false;

  ngOnInit() {
    this.loadWalletData();
  }

  loadWalletData() {
    this.isLoading = true;

    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        this.balance = res?.data?.balance ?? 0;
        this.lockedFunds = res?.data?.lockedFunds ?? 0;
      },
      error: (err) => alert(err?.error?.message || 'Failed to load wallet.'),
    });

    this.financeService.listTransactions({ limit: 25 }).subscribe({
      next: (res) => {
        const items = res?.data?.transactions ?? [];
        this.transactions = items.map((trx: any) => ({
          id: trx._id,
          date: trx.createdAt ? new Date(trx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          type: this.isCreditType(trx.type) ? 'Credit' : 'Debit',
          amount: Math.abs(trx.amount || 0),
          description: trx.note || trx.type,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert(err?.error?.message || 'Failed to load transactions.');
      },
    });
  }

  openTopupModal() {
    this.isTopupModalOpen = true;
    this.paymentMethod = 'checkout';
    this.topupAmount = 0;
    this.isPaymentProcessing = false;
  }

  closeTopupModal() {
    if (this.isPaymentProcessing) return;
    this.isTopupModalOpen = false;
  }

  setPaymentMethod(method: 'checkout' | 'upi_qr') {
    this.paymentMethod = method;
  }

  async startRazorpayPayment() {
    if (this.topupAmount < 1000) {
      alert('Minimum online topup amount is INR 1,000');
      return;
    }

    this.isPaymentProcessing = true;
    try {
      await this.financeService.startRazorpayWalletTopup(this.topupAmount, this.paymentMethod);
      this.isPaymentProcessing = false;
      this.closeTopupModal();
      alert(`Payment successful. INR ${this.topupAmount.toLocaleString('en-IN')} has been added to your available balance.`);
      this.loadWalletData();
    } catch (err: any) {
      alert(err?.error?.message || err?.message || 'Payment could not be completed.');
      this.isPaymentProcessing = false;
    }
  }

  private isCreditType(type: string): boolean {
    return ['CREDIT', 'TOPUP', 'REFUND', 'COD_CREDIT', 'TRANSFER_CREDIT'].includes(type);
  }
}
