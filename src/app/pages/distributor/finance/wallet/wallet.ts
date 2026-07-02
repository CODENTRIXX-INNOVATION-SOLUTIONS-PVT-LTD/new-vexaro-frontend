import { Component, OnInit } from '@angular/core';
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
  balance: number = 0;
  lockedFunds: number = 0;
  transactions: any[] = [];
  isLoading: boolean = false;
  
  isTopupModalOpen: boolean = false;
  paymentMethod: 'bank' | 'razorpay' = 'bank';
  topupAmount: number = 0;
  topupReference: string = '';
  
  // Razorpay simulation state
  onlineStep: 'input' | 'gateway' | 'success' = 'input';
  selectedOnlineMethod: 'card' | 'upi' | 'netbanking' = 'upi';

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadWalletData();
  }

  loadWalletData() {
    this.isLoading = true;
    this.financeService.getMyWallet().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.balance = response.data.balance || 0;
          this.lockedFunds = response.data.lockedFunds || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.isLoading = false;
      }
    });

    this.financeService.listTransactions().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.transactions) {
          this.transactions = response.data.transactions.slice(0, 5).map((t: any) => ({
            id: t.id,
            date: t.date || t.createdAt,
            type: t.type,
            amount: t.amount,
            status: t.status,
            description: t.description || t.category
          }));
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  openTopupModal() {
    this.isTopupModalOpen = true;
    this.paymentMethod = 'bank';
    this.topupAmount = 0;
    this.topupReference = '';
    this.onlineStep = 'input';
  }

  closeTopupModal() {
    this.isTopupModalOpen = false;
  }

  setPaymentMethod(method: 'bank' | 'razorpay') {
    this.paymentMethod = method;
    this.topupAmount = 0;
    this.topupReference = '';
    this.onlineStep = 'input';
  }

  submitTopupRequest() {
    if (this.topupAmount <= 0 || !this.topupReference) return;
    // TODO: POST /distributor/:id/wallet/topup-request
    console.log(`Requested UTR topup of ₹${this.topupAmount} with ref: ${this.topupReference}`);
    alert(`UTR Topup Request of ₹${this.topupAmount.toLocaleString('en-IN')} submitted! Status will update once approved by Admin.`);
    this.closeTopupModal();
  }

  startRazorpayPayment() {
    if (this.topupAmount < 1000) {
      alert('Minimum online topup amount is ₹1,000');
      return;
    }
    this.onlineStep = 'gateway';
  }

  selectOnlineMethod(method: 'card' | 'upi' | 'netbanking') {
    this.selectedOnlineMethod = method;
  }

  completeRazorpayPayment() {
    this.onlineStep = 'success';
    
    // Simulate updating backend wallet state
    setTimeout(() => {
      this.balance += this.topupAmount;
      const newTxnId = 'TXN' + Math.floor(8004 + Math.random() * 1000);
      const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      
      this.transactions.unshift({
        id: newTxnId,
        date: currentDate,
        type: 'Credit',
        amount: this.topupAmount,
        status: 'Completed',
        description: 'Razorpay Online Topup'
      });
      
      this.closeTopupModal();
      alert(`Payment Successful! ₹${this.topupAmount.toLocaleString('en-IN')} has been added to your Available Balance.`);
    }, 1200);
  }
}
