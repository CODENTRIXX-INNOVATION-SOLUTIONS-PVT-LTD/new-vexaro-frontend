import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FinanceService } from '../../../services/finance.service';
import { DisputeService } from '../../../services/dispute.service';
import { SupportService } from '../../../services/support.service';
import { AuthService } from '../../../services/auth.service';

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

export interface DistributorTopupRequest {
  id: string;
  date: string;
  amount: number;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string;
}

interface WalletTopupPolicy {
  phase: 'training_first_topup' | 'reserve_completion_topup' | 'standard';
  minAmount: number;
  maxAmount: number | null;
  message: string | null;
  reserveEstablished: boolean;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit, OnDestroy {
  private financeService = inject(FinanceService);
  private disputeService = inject(DisputeService);
  private supportService = inject(SupportService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // ── Active Tab ────────────────────────────────────────────────────────────
  activeTab = 'balance';

  changeTab(tab: string): void {
    this.activeTab = tab;
    this.topupSuccess = '';
    this.topupError = '';
    if (tab === 'payments')      this.loadRazorpayPayments();
    if (tab === 'disputes')      this.loadDisputes();
    if (tab === 'transactions')  this.loadTransactions();
    if (tab === 'requests')      this.loadRefundRequests();
    if (tab === 'refunds')       this.loadRefundRequests();
    if (tab === 'dist-request')  this.loadDistributorRequests();
  }

  // ── Wallet ────────────────────────────────────────────────────────────────
  balance = 0;
  reservedBalance = 0;
  availableBalance = 0;
  codEscrowBalance = 0;
  topupPolicy: WalletTopupPolicy | null = null;

  // ── Razorpay Top-up ───────────────────────────────────────────────────────
  packages = [2500, 5000, 10000, 25000];
  customAmounts = [100, 200, 500, 1000];
  selectedPackage: number | null = null;
  customAmount: number | string | null = null;
  customAmountNumber: number | null = null;
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

  // ── Refund Requests ───────────────────────────────────────────────────────
  refundRequests: RefundRequest[] = [];
  refundRequestsLoading = false;
  showRefundForm = false;
  newRefund = { shipmentId: '', amount: null as number | null, reason: '' };
  refundSubmitting = false;
  refundFormError = '';
  refundFormSuccess = '';

  // ── Request from Distributor ──────────────────────────────────────────────
  distributorRequests: DistributorTopupRequest[] = [];
  requestApprover: 'Distributor' | 'Super Admin' = 'Distributor';
  distRequestsLoading = false;
  distRequestAmount: number | null = null;
  distRequestNote = '';
  distRequestSubmitting = false;
  distRequestSuccess = '';
  distRequestError = '';

  // ── Weight Disputes ───────────────────────────────────────────────────────
  disputes: WeightDispute[] = [];
  showContestModal = false;
  contestingDispute: WeightDispute | null = null;
  contestNote = '';
  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];
  isContestSubmitting = false;
  contestError = '';
  contestSuccess = '';

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadWalletDetails();
    this.loadRequestApprover();
    this.loadTransactions();
    this.loadRefundRequests();
    this.loadRazorpayPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadWalletDetails(): void {
    this.financeService.getMyWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.balance          = res.data.balance         ?? 0;
            this.codEscrowBalance = res.data.codEscrowBalance ?? 0;
            this.reservedBalance  = res.data.reservedBalance  ?? 0;
            this.availableBalance = res.data.availableBalance ?? 0;
            this.topupPolicy      = res.data.topupPolicy ?? null;
            this.applyTopupPolicyOptions();
          }
        },
        error: () => {},
      });
  }

  loadRequestApprover(): void {
    this.authService.getMe()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const user = res?.data?.user ?? res?.data ?? res?.user ?? res;
          this.requestApprover = user?.invitedBy ? 'Distributor' : 'Super Admin';
        },
        error: () => {
          this.requestApprover = 'Distributor';
        },
      });
  }

  loadTransactions(): void {
    if (this.txLoading || this.transactions.length > 0) return;
    this.txLoading = true;
    this.financeService.listTransactions({ limit: 50 })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.txLoading = false; }))
      .subscribe({
        next: (res) => {
          const DEBIT_TYPES = new Set(['DEBIT', 'CHARGE', 'SETTLEMENT', 'TRANSFER_DEBIT', 'DISPUTE_CHARGE', 'RTO_CHARGE']);
          this.transactions = (res?.data?.transactions ?? []).map((t: any) => ({
            id:          t._id,
            date:        this.formatDateTime(t.createdAt),
            description: t.note || this.formatTxType(t.type),
            type:        DEBIT_TYPES.has(t.type) ? 'debit' : 'credit',
            amount:      Math.abs(t.amount ?? 0),
            status:      'Success',
            reference:   t.reference || '—',
          }));
        },
        error: () => {},
      });
  }

  loadRazorpayPayments(): void {
    if (this.paymentsLoading) return;
    this.paymentsLoading = true;
    const params: any = { page: this.paymentsPage, limit: this.paymentsLimit };
    if (this.paymentsFilter) params.status = this.paymentsFilter;
    this.financeService.listPayments(params)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.paymentsLoading = false; }))
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.payments ?? [];
          this.paymentsTotal    = res?.meta?.total ?? raw.length;
          this.razorpayPayments = raw.map((p: any) => ({
            id:                p._id,
            date:              this.formatDateTime(p.createdAt),
            amount:            p.amountRupees ?? p.amount,
            method:            p.paymentMethod ?? null,
            status:            p.status,
            razorpayOrderId:   p.razorpayOrderId,
            razorpayPaymentId: p.razorpayPaymentId ?? null,
          }));
        },
        error: () => {},
      });
  }

  loadRefundRequests(): void {
    if (this.refundRequestsLoading) return;
    this.refundRequestsLoading = true;
    this.financeService.listRefundRequests({ limit: 50 })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.refundRequestsLoading = false; }))
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.refundRequests ?? res?.data?.requests ?? [];
          this.refundRequests = raw.map((r: any) => ({
            id:         r._id,
            date:       this.formatDateTime(r.createdAt),
            awb:        r.shipmentId?.awb ?? r.awb ?? '—',
            amount:     r.amount ?? 0,
            reason:     r.reason ?? '—',
            status:     r.status ?? 'PENDING',
            reviewNote: r.reviewNote ?? '—',
          }));
        },
        error: () => {},
      });
  }

  loadDistributorRequests(): void {
    if (this.distRequestsLoading) return;
    this.distRequestsLoading = true;
    this.financeService.listMerchantRechargeRequests({ limit: 50 })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.distRequestsLoading = false; }))
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.requests ?? [];
          this.distributorRequests = raw.map((r: any) => ({
            id:              r._id,
            date:            this.formatDateTime(r.createdAt),
            amount:          r.amount ?? 0,
            note:            r.note   ?? '—',
            status:          r.status ?? 'PENDING',
            rejectionReason: r.rejectionReason ?? '—',
          }));
        },
        error: () => {},
      });
  }

  loadDisputes(): void {
    this.disputeService.listDisputes({ limit: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.data?.items) {
            this.disputes = res.data.items.map((d: any) => ({
              id:           d._id,
              date:         this.formatDateTime(d.createdAt),
              awb:          d.shipmentId?.awb || '—',
              billedWeight: d.billedWeight || 0,
              actualWeight: d.actualWeight || 0,
              difference:   Math.max(0, (d.actualWeight || 0) - (d.billedWeight || 0)),
              deduction:    d.extraCharge || 0,
              status:       d.status,
              contestNote:  d.description || '',
              attachments:  (d.proofImages || []).map((img: string) => img.split('/').pop()),
            }));
          }
        },
        error: () => {},
      });
  }

  // ── Razorpay Top-up ───────────────────────────────────────────────────────

  scrollToTopupForm(): void {
    this.activeTab = 'balance';
    setTimeout(() => {
      const el = document.getElementById('topup-form');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  selectPackage(amount: number): void {
    this.selectedPackage  = amount;
    this.customAmount     = null;
    this.topupSuccess     = '';
    this.topupError       = '';
    this.distRequestError = '';
  }

  selectCustomAmount(): void {
    this.selectedPackage = null;
    this.customAmount = '';
    this.customAmountNumber = null;
    this.topupSuccess    = '';
    this.topupError      = '';
    this.distRequestError = '';
  }

  async submitTopUp(): Promise<void> {
    let amount: number | null = null;
    
    if (this.selectedPackage) {
      amount = this.selectedPackage;
    } else if (typeof this.customAmount === 'number' && this.customAmount > 0) {
      amount = this.customAmount;
    } else if (this.customAmount === 'custom' && this.customAmountNumber && this.customAmountNumber > 0) {
      amount = this.customAmountNumber;
    }
    
    if (!amount || amount <= 0) {
      this.topupError = 'Please select or enter a valid amount to add.';
      return;
    }
    
    if (amount < 100) {
      this.topupError = 'Minimum top-up amount is ₹100.';
      return;
    }

    const policyError = this.getTopupValidationError(amount);
    if (policyError) {
      this.topupError = policyError;
      return;
    }
    
    this.isPaymentProcessing = true;
    this.topupSuccess = '';
    this.topupError   = '';
    try {
      const result = await this.financeService.startRazorpayWalletTopup(amount);
      this.balance      = result.balance;
      this.topupSuccess = `₹${amount.toLocaleString('en-IN')} added to your wallet successfully!`;
      this.selectedPackage  = null;
      this.customAmount     = null;
      this.customAmountNumber = null;
      this.transactions     = [];
      this.txLoading        = false;
      this.loadTransactions();
      this.razorpayPayments = [];
      this.paymentsLoading  = false;
      this.loadWalletDetails();
      this.loadRazorpayPayments();
    } catch (err: any) {
      this.topupError = err?.error?.message || err?.message || 'Payment could not be completed.';
    } finally {
      this.isPaymentProcessing = false;
    }
  }

  // ── Request from Distributor ──────────────────────────────────────────────

  submitDistributorRequest(): void {
    if (!this.distRequestAmount || this.distRequestAmount <= 0) {
      this.distRequestError = 'Please enter a valid amount.';
      return;
    }
    const policyError = this.getTopupValidationError(this.distRequestAmount);
    if (policyError) {
      this.distRequestError = policyError;
      return;
    }
    this.distRequestSubmitting = true;
    this.distRequestSuccess    = '';
    this.distRequestError      = '';

    this.financeService.createMerchantRechargeRequest({
      amount: this.distRequestAmount,
      note:   this.distRequestNote.trim() || undefined,
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.distRequestSubmitting = false; }),
    )
    .subscribe({
      next: () => {
        this.distRequestSuccess = `Top-up request for ₹${this.distRequestAmount!.toLocaleString('en-IN')} sent to your ${this.requestApprover}.`;
        this.distRequestAmount  = null;
        this.distRequestNote    = '';
        // Force reload the list fresh
        this.distRequestsLoading = false;
        this.loadDistributorRequests();
      },
      error: (err: any) => {
        this.distRequestError = err?.error?.message ?? 'Failed to send request. Please try again.';
      },
    });
  }

  // ── Refund Request Form ───────────────────────────────────────────────────

  openRefundForm(): void {
    this.showRefundForm  = true;
    this.newRefund       = { shipmentId: '', amount: null, reason: '' };
    this.refundFormError = '';
    this.refundFormSuccess = '';
  }

  closeRefundForm(): void { this.showRefundForm = false; }

  submitRefundRequest(): void {
    if (!this.newRefund.shipmentId.trim() || !this.newRefund.amount || !this.newRefund.reason.trim()) {
      this.refundFormError = 'All fields are required.';
      return;
    }
    this.refundSubmitting = true;
    this.refundFormError  = '';
    this.financeService.submitRefundRequest({
      shipmentId: this.newRefund.shipmentId.trim(),
      amount:     this.newRefund.amount,
      reason:     this.newRefund.reason.trim(),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.refundSubmitting = false; }),
    )
    .subscribe({
      next: () => {
        this.refundFormSuccess = 'Refund request submitted successfully.';
        this.newRefund         = { shipmentId: '', amount: null, reason: '' };
        this.refundRequestsLoading = false;
        this.loadRefundRequests();
        setTimeout(() => { this.showRefundForm = false; this.refundFormSuccess = ''; }, 2000);
      },
      error: (err: any) => {
        this.refundFormError = err?.error?.message ?? 'Failed to submit refund request.';
      },
    });
  }

  // ── Payments pagination / filter ──────────────────────────────────────────

  applyPaymentsFilter(): void {
    this.paymentsPage    = 1;
    this.paymentsLoading = false;
    this.loadRazorpayPayments();
  }

  get paymentsTotalPages(): number { return Math.ceil(this.paymentsTotal / this.paymentsLimit); }

  prevPaymentsPage(): void {
    if (this.paymentsPage > 1) { this.paymentsPage--; this.paymentsLoading = false; this.loadRazorpayPayments(); }
  }

  nextPaymentsPage(): void {
    if (this.paymentsPage < this.paymentsTotalPages) { this.paymentsPage++; this.paymentsLoading = false; this.loadRazorpayPayments(); }
  }

  // ── Computed badges ───────────────────────────────────────────────────────

  get totalSpent(): number {
    return this.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  }

  get pendingRequestsCount(): number {
    return this.refundRequests.filter(r => r.status === 'PENDING').length;
  }

  get pendingDistRequestsCount(): number {
    return this.distributorRequests.filter(r => r.status === 'PENDING').length;
  }

  get requestTabLabel(): string {
    return `Request from ${this.requestApprover}`;
  }

  get requestTitle(): string {
    return `Request Wallet Top-up from ${this.requestApprover}`;
  }

  get requestDescription(): string {
    return this.requestApprover === 'Super Admin'
      ? 'Super Admin will receive a notification and can approve the transfer directly from their wallet.'
      : 'Your distributor will receive a notification and can approve the transfer directly from their wallet.';
  }

  get requestSubmitLabel(): string {
    return `Send Request to ${this.requestApprover}`;
  }

  get requestHistorySubtitle(): string {
    return `Requests sent to your ${this.requestApprover.toLowerCase()}`;
  }

  get totalDisputeDeductions(): number {
    return this.disputes.filter(d => d.status === 'Applied').reduce((s, d) => s + d.deduction, 0);
  }

  get minTopupAmount(): number {
    return this.topupPolicy?.minAmount ?? 100;
  }

  get maxTopupAmount(): number | null {
    return this.topupPolicy?.maxAmount ?? null;
  }

  get topupPolicyMessage(): string {
    return this.topupPolicy?.message ?? '';
  }

  private applyTopupPolicyOptions(): void {
    if (this.topupPolicy?.phase === 'training_first_topup') {
      this.packages = [200, 500, 1000, 2000];
      this.customAmounts = [200, 500, 1000, 2000];
    } else if (this.topupPolicy?.phase === 'reserve_completion_topup') {
      const min = Math.max(1, this.topupPolicy.minAmount || 1);
      this.packages = Array.from(new Set([min, 2500, 5000, 10000, 25000]))
        .filter((amount) => amount >= min);
      this.customAmounts = Array.from(new Set([min, 1000, 2000, 5000]))
        .filter((amount) => amount >= min);
    } else {
      this.packages = [2500, 5000, 10000, 25000];
      this.customAmounts = [100, 200, 500, 1000];
    }

    if (this.selectedPackage && this.getTopupValidationError(this.selectedPackage)) {
      this.selectedPackage = null;
    }
  }

  private getTopupValidationError(amount: number): string {
    if (amount < this.minTopupAmount) {
      return this.topupPolicyMessage || `Minimum top-up amount is INR ${this.minTopupAmount.toLocaleString('en-IN')}.`;
    }
    if (this.maxTopupAmount && amount > this.maxTopupAmount) {
      return `First training top-up cannot be more than INR ${this.maxTopupAmount.toLocaleString('en-IN')}.`;
    }
    return '';
  }

  // ── Contest Dispute ───────────────────────────────────────────────────────

  openContest(dispute: WeightDispute): void {
    this.contestingDispute = dispute;
    this.contestNote = '';
    this.selectedFiles = [];
    this.selectedFileNames = [];
    this.contestError = '';
    this.showContestModal = true;
    this.contestSuccess    = '';
  }

  closeContest(): void {
    this.showContestModal  = false;
    this.contestingDispute = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.selectedFileNames = this.selectedFiles.map(f => f.name);
      this.contestError = '';
    }
//     if (input.files) this.selectedFileNames = Array.from(input.files).map(f => f.name);
  }

  submitContest(): void {
    if (!this.contestNote.trim()) {
      this.contestError = 'Please describe why you believe this deduction is incorrect.';
      return;
    }
    if (!this.selectedFiles.length) {
      this.contestError = 'Please attach at least one proof file.';
      return;
    }
    if (this.contestingDispute && !this.isContestSubmitting) {
      this.isContestSubmitting = true;
      this.contestError = '';
      forkJoin(this.selectedFiles.map(file => this.supportService.uploadAttachment(file))).subscribe({
        next: (uploadResponses) => {
          const proofUrls = uploadResponses.map(res => res?.data?.url).filter(Boolean);
          this.disputeService.submitProof(this.contestingDispute!.id, proofUrls).subscribe({
            next: () => {
              this.contestSuccess = 'Dispute proof submitted successfully.';
              this.isContestSubmitting = false;
              this.loadDisputes();
              setTimeout(() => this.closeContest(), 1500);
            },
            error: (err) => {
              this.isContestSubmitting = false;
              this.contestError = err.error?.message || 'Failed to submit proof.';
            },
          });
        },
        error: (err) => {
          this.isContestSubmitting = false;
          this.contestError = err.error?.message || 'Failed to upload proof files.';
        },
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private formatTxType(type: string): string {
    const map: Record<string, string> = {
      TOPUP:           'Wallet Top-up',
      CHARGE:          'Shipment Charge',
      REFUND:          'Refund',
      COD_CREDIT:      'COD Credit',
      TRANSFER_CREDIT: 'Transfer In',
      TRANSFER_DEBIT:  'Transfer Out',
      DISPUTE_CHARGE:  'Dispute Deduction',
      RTO_CHARGE:      'RTO Charge',
    };
    return map[type] ?? type;
  }

  private formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
