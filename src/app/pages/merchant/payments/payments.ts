import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';
import { DisputeService } from '../../../services/dispute.service';

export interface MerchantTransaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
}

export interface RazorpayPaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
}

export interface RefundRequest {
  id: string;
  date: string;
  awb: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string;
}

export interface WeightDispute {
  id: string;
  date: string;
  awb: string;
  billedWeight: number;
  actualWeight: number;
  difference: number;
  deduction: number;
  status: string;
  contestNote?: string;
  attachments?: string[];
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  private financeService = inject(FinanceService);
  private disputeService = inject(DisputeService);

  // ── Active Tab ────────────────────────────────────────────────────────────
  activeTab = 'balance';

  changeTab(tab: string): void {
    this.activeTab = tab;
    this.topupSuccess = '';
    this.topupError = '';
    if (tab === 'payments')     this.loadRazorpayPayments();
    if (tab === 'refunds')      this.loadRefundRequests();
    if (tab === 'requests')     this.loadRefundRequests();  // recharge requests tab reuses refund history
    if (tab === 'transactions') this.loadTransactions();
  }

  // ── Wallet ────────────────────────────────────────────────────────────────
  balance = 0;
  codEscrowBalance = 0;

  // ── Razorpay Top-up ───────────────────────────────────────────────────────
  packages = [1000, 2500, 5000, 10000, 25000];
  selectedPackage: number | null = null;
  topUpMethod: 'checkout' | 'upi_qr' = 'checkout';
  isPaymentProcessing = false;
  topupSuccess = '';
  topupError = '';

  // ── Transaction History ───────────────────────────────────────────────────
  transactions: MerchantTransaction[] = [];
  txLoading = false;

  // ── Razorpay Payment History ──────────────────────────────────────────────
  razorpayPayments: RazorpayPaymentRecord[] = [];
  paymentsLoading = false;
  paymentsTotal = 0;
  paymentsPage = 1;
  paymentsLimit = 10;
  paymentsFilter: '' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' = '';

  // ── Refund Requests (shipment refunds submitted to distributor) ───────────
  refundRequests: RefundRequest[] = [];
  refundRequestsLoading = false;

  // ── Submit Refund Request form ────────────────────────────────────────────
  showRefundForm = false;
  newRefund = { shipmentId: '', amount: null as number | null, reason: '' };
  refundSubmitting = false;
  refundFormError = '';
  refundFormSuccess = '';

  // ── Weight Disputes ───────────────────────────────────────────────────────
  disputes: WeightDispute[] = [];

  // ── Contest Dispute Modal ─────────────────────────────────────────────────
  showContestModal = false;
  contestingDispute: WeightDispute | null = null;
  contestNote = '';
  selectedFileNames: string[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadWalletDetails();
    this.loadTransactions();
    this.loadDisputes();
    this.loadRefundRequests();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadWalletDetails(): void {
    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        if (res?.data) {
          this.balance = res.data.balance ?? 0;
          this.codEscrowBalance = res.data.codEscrowBalance ?? 0;
        }
      },
      error: (err) => console.error('Wallet load failed', err),
    });
  }

  loadTransactions(): void {
    this.txLoading = true;
    this.financeService.listTransactions({ limit: 50 }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.transactions ?? [];
        this.transactions = raw.map((t: any) => ({
          id: t._id,
          date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: t.note || this.formatTxType(t.type),
          type: t.amount >= 0 ? 'credit' : 'debit',
          amount: Math.abs(t.amount ?? 0),
          status: 'Success',
          reference: t.reference || '—',
        }));
        this.txLoading = false;
      },
      error: (err) => { console.error('Transactions load failed', err); this.txLoading = false; },
    });
  }

  loadRazorpayPayments(): void {
    this.paymentsLoading = true;
    const params: any = { page: this.paymentsPage, limit: this.paymentsLimit };
    if (this.paymentsFilter) params.status = this.paymentsFilter;

    this.financeService.listPayments(params).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.payments ?? [];
        this.paymentsTotal = res?.meta?.total ?? raw.length;
        this.razorpayPayments = raw.map((p: any) => ({
          id: p._id,
          date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: p.amountRupees ?? p.amount,
          method: p.paymentMethod ?? null,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId ?? null,
        }));
        this.paymentsLoading = false;
      },
      error: () => { this.paymentsLoading = false; },
    });
  }

  loadRefundRequests(): void {
    this.refundRequestsLoading = true;
    this.financeService.listRefundRequests({ limit: 50 }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.refundRequests ?? res?.data?.requests ?? [];
        this.refundRequests = raw.map((r: any) => ({
          id: r._id,
          date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          awb: r.shipmentId?.awb ?? r.awb ?? '—',
          amount: r.amount ?? 0,
          reason: r.reason ?? '—',
          status: r.status ?? 'PENDING',
          reviewNote: r.reviewNote ?? '—',
        }));
        this.refundRequestsLoading = false;
      },
      error: (err) => { console.error('Refund requests load failed', err); this.refundRequestsLoading = false; },
    });
  }

  loadDisputes(): void {
    this.disputeService.listDisputes({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.data?.items) {
          this.disputes = res.data.items.map((d: any) => ({
            id: d._id,
            date: new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            awb: d.shipmentId?.awb || '—',
            billedWeight: d.billedWeight || 0,
            actualWeight: d.actualWeight || 0,
            difference: Math.max(0, (d.actualWeight || 0) - (d.billedWeight || 0)),
            deduction: d.extraCharge || 0,
            status: d.status,
            contestNote: d.description || '',
            attachments: (d.proofImages || []).map((img: string) => img.split('/').pop()),
          }));
        }
      },
      error: (err) => console.error('Disputes load failed', err),
    });
  }

  // ── Top-up ────────────────────────────────────────────────────────────────

  selectPackage(amount: number): void {
    this.selectedPackage = amount;
    this.topupSuccess = '';
    this.topupError = '';
  }

  async submitTopUp(): Promise<void> {
    if (!this.selectedPackage) {
      this.topupError = 'Please select an amount to add.';
      return;
    }
    this.isPaymentProcessing = true;
    this.topupSuccess = '';
    this.topupError = '';
    try {
      const result = await this.financeService.startRazorpayWalletTopup(this.selectedPackage, this.topUpMethod);
      this.balance = result.balance;
      this.topupSuccess = `₹${this.selectedPackage.toLocaleString('en-IN')} added to your wallet successfully!`;
      this.selectedPackage = null;
      this.loadTransactions();
    } catch (err: any) {
      this.topupError = err?.error?.message || err?.message || 'Payment could not be completed.';
    } finally {
      this.isPaymentProcessing = false;
    }
  }

  // ── Refund Request Form ───────────────────────────────────────────────────

  openRefundForm(): void {
    this.showRefundForm = true;
    this.newRefund = { shipmentId: '', amount: null, reason: '' };
    this.refundFormError = '';
    this.refundFormSuccess = '';
  }

  closeRefundForm(): void {
    this.showRefundForm = false;
  }

  submitRefundRequest(): void {
    if (!this.newRefund.shipmentId.trim() || !this.newRefund.amount || !this.newRefund.reason.trim()) {
      this.refundFormError = 'All fields are required.';
      return;
    }
    this.refundSubmitting = true;
    this.refundFormError = '';
    this.financeService.submitRefundRequest({
      shipmentId: this.newRefund.shipmentId.trim(),
      amount: this.newRefund.amount,
      reason: this.newRefund.reason.trim(),
    }).subscribe({
      next: () => {
        this.refundFormSuccess = 'Refund request submitted successfully.';
        this.refundSubmitting = false;
        this.newRefund = { shipmentId: '', amount: null, reason: '' };
        this.loadRefundRequests();
        setTimeout(() => { this.showRefundForm = false; this.refundFormSuccess = ''; }, 2000);
      },
      error: (err: any) => {
        this.refundFormError = err?.error?.message ?? 'Failed to submit refund request.';
        this.refundSubmitting = false;
      },
    });
  }

  // ── Payments pagination / filter ──────────────────────────────────────────

  applyPaymentsFilter(): void {
    this.paymentsPage = 1;
    this.loadRazorpayPayments();
  }

  get paymentsTotalPages(): number {
    return Math.ceil(this.paymentsTotal / this.paymentsLimit);
  }

  prevPaymentsPage(): void {
    if (this.paymentsPage > 1) { this.paymentsPage--; this.loadRazorpayPayments(); }
  }

  nextPaymentsPage(): void {
    if (this.paymentsPage < this.paymentsTotalPages) { this.paymentsPage++; this.loadRazorpayPayments(); }
  }

  // ── Computed badges ───────────────────────────────────────────────────────

  get totalSpent(): number {
    return this.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  }

  get pendingRequestsCount(): number {
    // Recharge requests tab repurposed — show pending refund requests count
    return this.refundRequests.filter(r => r.status === 'PENDING').length;
  }

  get pendingRefundsCount(): number {
    return this.refundRequests.filter(r => r.status === 'PENDING').length;
  }

  get totalDisputeDeductions(): number {
    return this.disputes.filter(d => d.status === 'Applied').reduce((s, d) => s + d.deduction, 0);
  }

  // ── Contest Dispute ───────────────────────────────────────────────────────

  openContest(dispute: WeightDispute): void {
    this.contestingDispute = dispute;
    this.contestNote = '';
    this.selectedFileNames = [];
    this.showContestModal = true;
  }

  closeContest(): void {
    this.showContestModal = false;
    this.contestingDispute = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFileNames = Array.from(input.files).map(f => f.name);
    }
  }

  submitContest(): void {
    if (!this.contestNote.trim()) {
      alert('Please describe why you believe this deduction is incorrect.');
      return;
    }
    if (this.contestingDispute) {
      const mockImageUrls = this.selectedFileNames.map(f => `/uploads/proofs/${f}`);
      this.disputeService.submitProof(this.contestingDispute.id, mockImageUrls).subscribe({
        next: () => {
          alert('Dispute proof submitted successfully!');
          this.loadDisputes();
          this.closeContest();
        },
        error: (err) => alert(err.error?.message || 'Failed to submit proof.'),
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private formatTxType(type: string): string {
    const map: Record<string, string> = {
      TOPUP: 'Wallet Top-up', CHARGE: 'Shipment Charge', REFUND: 'Refund',
      COD_CREDIT: 'COD Credit', TRANSFER_CREDIT: 'Transfer In',
      TRANSFER_DEBIT: 'Transfer Out', DISPUTE_CHARGE: 'Dispute Deduction', RTO_CHARGE: 'RTO Charge',
    };
    return map[type] ?? type;
  }
}
