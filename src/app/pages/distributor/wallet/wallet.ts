import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';

export interface RazorpayPaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  reference: string;
}

@Component({
  selector: 'app-distributor-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class DistributorWallet implements OnInit {
  private financeService = inject(FinanceService);

  // ── State ─────────────────────────────────────────────────────────────────
  activeTab: 'topup' | 'history' | 'transactions' | 'request' = 'topup';
  balance: number = 0;

  // Top-up form
  packages = [5000, 10000, 25000, 50000, 100000];
  selectedPackage: number | null = null;
  topUpMode: 'checkout' | 'upi_qr' = 'checkout';
  isProcessing = false;
  successMessage = '';
  errorMessage = '';

  // Payment history
  payments: RazorpayPaymentRecord[] = [];
  paymentsLoading = false;
  paymentsTotal = 0;
  paymentsPage = 1;
  paymentsLimit = 10;

  // Transaction history
  transactions: any[] = [];
  txLoading = false;

  // Recharge requests (manual, sent to admin)
  myRequests: any[] = [];
  requestPaymentMethod = 'UPI';
  requestReferenceId = '';
  requestLoading = false;

  ngOnInit(): void {
    // Only load balance and payment history on init — transactions/recharge loaded lazily
    this.loadWallet();
    this.loadPaymentHistory();
  }

  // ── Data loaders ─────────────────────────────────────────────────────────

  loadWallet(): void {
    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        if (res?.data) this.balance = res.data.balance ?? 0;
      },
      error: (err) => console.error('Wallet load failed', err),
    });
  }

  loadTransactions(): void {
    if (this.txLoading || this.transactions.length > 0) return; // prevent duplicate calls
    this.txLoading = true;
    this.financeService.listTransactions({ limit: 50 }).subscribe({
      next: (res) => {
        this.transactions = (res?.data?.transactions ?? []).map((t: any) => ({
          id: t._id,
          date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: t.note || t.type,
          type: t.amount >= 0 ? 'credit' : 'debit',
          amount: Math.abs(t.amount),
          reference: t.reference || '—',
        }));
        this.txLoading = false;
      },
      error: () => { this.txLoading = false; },
    });
  }

  loadPaymentHistory(): void {
    if (this.paymentsLoading) return; // prevent duplicate calls
    this.paymentsLoading = true;
    this.financeService.listPayments({ page: this.paymentsPage, limit: this.paymentsLimit }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.payments ?? [];
        this.paymentsTotal = res?.meta?.total ?? raw.length;
        this.payments = raw.map((p: any) => ({
          id: p._id,
          date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: p.amountRupees ?? p.amount,
          method: p.paymentMethod ?? null,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId ?? null,
          reference: p.razorpayPaymentId ? `RAZORPAY-${p.razorpayPaymentId}` : p.razorpayOrderId,
        }));
        this.paymentsLoading = false;
      },
      error: () => { this.paymentsLoading = false; },
    });
  }

  loadRechargeRequests(): void {
    this.financeService.listRechargeRequests({ limit: 50 }).subscribe({
      next: (res) => {
        this.myRequests = (res?.data?.rechargeRequests ?? res?.data?.requests ?? []).map((r: any) => ({
          id: r._id,
          requestId: r._id?.slice(-8).toUpperCase(),
          date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: r.amount,
          method: r.paymentMethod,
          reference: r.referenceId || '—',
          status: r.status,
        }));
      },
      error: (err) => console.error('Recharge requests failed', err),
    });
  }

  // ── Razorpay Top-up ───────────────────────────────────────────────────────

  selectPackage(amount: number): void {
    this.selectedPackage = amount;
    this.successMessage = '';
    this.errorMessage = '';
  }

  async startTopup(): Promise<void> {
    if (!this.selectedPackage) {
      this.errorMessage = 'Please select an amount.';
      return;
    }
    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.financeService.startRazorpayWalletTopup(this.selectedPackage, this.topUpMode);
      this.balance = result.balance;
      this.successMessage = `₹${this.selectedPackage.toLocaleString('en-IN')} successfully added to your wallet!`;
      this.selectedPackage = null;
      // Reset guards so refresh works
      this.payments = [];
      this.paymentsLoading = false;
      this.transactions = [];
      this.txLoading = false;
      this.loadPaymentHistory();
      this.loadTransactions();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Payment could not be completed.';
    } finally {
      this.isProcessing = false;
    }
  }

  // ── Manual Recharge Request ───────────────────────────────────────────────
  // Distributor submits a manual recharge request that Super Admin approves.

  submitRechargeRequest(): void {
    if (!this.selectedPackage) {
      this.errorMessage = 'Please select a recharge amount.';
      return;
    }
    this.requestLoading = true;
    this.errorMessage = '';
    this.financeService.createRechargeRequest({
      amount: this.selectedPackage,
      paymentMethod: this.requestPaymentMethod as 'UPI' | 'NEFT' | 'IMPS' | 'RTGS' | 'Cash' | 'Cheque',
      referenceId: this.requestReferenceId || undefined,
    }).subscribe({
      next: () => {
        this.requestLoading = false;
        this.successMessage = `Recharge request for ₹${this.selectedPackage!.toLocaleString('en-IN')} submitted. The Super Admin will process it shortly.`;
        this.selectedPackage = null;
        this.requestReferenceId = '';
        // Refresh the requests list
        this.myRequests = [];
        this.loadRechargeRequests();
      },
      error: (err: any) => {
        this.requestLoading = false;
        this.errorMessage = err?.error?.message ?? 'Failed to submit recharge request.';
      },
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.paymentsTotal / this.paymentsLimit);
  }

  prevPage(): void {
    if (this.paymentsPage > 1) {
      this.paymentsPage--;
      this.loadPaymentHistory();
    }
  }

  nextPage(): void {
    if (this.paymentsPage < this.totalPages) {
      this.paymentsPage++;
      this.loadPaymentHistory();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  changeTab(tab: 'topup' | 'history' | 'transactions' | 'request'): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
    if (tab === 'history')      this.loadPaymentHistory();
    if (tab === 'transactions') this.loadTransactions();
    if (tab === 'request')      this.loadRechargeRequests();
  }

  get successPaymentsCount(): number {
    return this.payments.filter(p => p.status === 'SUCCESS').length;
  }

  get totalTopupAmount(): number {
    return this.payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  }
}
