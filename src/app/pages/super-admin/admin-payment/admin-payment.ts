import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-admin-payment',
  standalone: true,
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './admin-payment.html',
  styleUrl: './admin-payment.css',
})
export class AdminPayment implements OnInit {
  private financeService = inject(FinanceService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = 'adminwallet';
  isLoading = false;

  // ── Admin Wallet ──────────────────────────────────────────────────────────
  adminBalance = 0;
  adminWalletLoading = false;
  adminTopupPackages = [10000, 25000, 50000, 100000, 250000];
  adminSelectedPackage: number | null = null;
  adminTopupMode: 'checkout' | 'upi_qr' = 'checkout';
  adminTopupProcessing = false;
  adminTopupSuccess = '';
  adminTopupError = '';

  // ── Stats Cards ───────────────────────────────────────────────────────────
  paymentCards = [
    { title: 'Total Wallets Value',     value: '₹0', icon: 'fas fa-wallet',       bgColor: '#DBEAFE', iconColor: 'rgb(11,74,111)' },
    { title: 'Total Admin Commission',  value: '₹0', icon: 'fas fa-percent',       bgColor: '#DCFCE7', iconColor: '#16A34A' },
    { title: 'Successful Top-ups',      value: '0',  icon: 'fas fa-exchange-alt',  bgColor: '#FEF3C7', iconColor: '#D97706' },
    { title: 'Pending Refunds',         value: '0',  icon: 'fas fa-undo-alt',      bgColor: '#FEE2E2', iconColor: '#DC2626' },
  ];

  // ── Distributor Wallets ───────────────────────────────────────────────────
  distributors: any[] = [];

  // ── Recharge Form ─────────────────────────────────────────────────────────
  rechargeModel = { distributorId: '', amount: null as number | null, paymentMethod: 'UPI' as 'UPI' | 'NEFT' | 'IMPS' | 'RTGS' | 'Cash' | 'Cheque', referenceId: '' };
  rechargeSuccess = '';
  rechargeError = '';

  // ── Transactions ──────────────────────────────────────────────────────────
  payments: any[] = [];

  // ── Razorpay Payments ─────────────────────────────────────────────────────
  razorpayPayments: any[] = [];
  rzpLoading = false;
  rzpTotal = 0;
  rzpPage = 1;
  rzpLimit = 15;
  rzpFilter: '' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' = '';

  // Refund modal
  showRefundModal = false;
  refundPayment: any = null;
  refundReason = '';
  refundAmount: number | null = null;
  refundProcessing = false;

  // ── Refund Requests ───────────────────────────────────────────────────────
  refunds: any[] = [];

  // ── Recharge Requests ─────────────────────────────────────────────────────
  rechargeRequestsData: any[] = [];
  rechargeRequestActionInProgress = '';
  rechargeRequestSuccess = '';
  rechargeRequestError   = '';
  rejectingRequestId     = '';
  rejectReasonInput      = '';

  // ── Commission ────────────────────────────────────────────────────────────
  commissionData: any[] = [];

  ngOnInit() { this.loadAll(); }

  changeTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'adminwallet' && this.adminBalance === 0) this.loadAdminWallet();
    if (tab === 'razorpay' && this.razorpayPayments.length === 0) this.loadRazorpayPayments();
    if (tab === 'commission' && this.commissionData.length === 0)  this.loadCommission();
    if (tab === 'refunds'   && this.refunds.length === 0)          this.loadRefunds();
    if (tab === 'requests'  && this.rechargeRequestsData.length === 0) this.loadRechargeRequests();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadAll() {
    this.isLoading = true;
    Promise.allSettled([
      this.loadStats(),
      this.loadAdminWallet(),
      this.loadDistributors(),
      this.loadTransactions(),
    ]).then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
    this.loadRechargeRequests();
  }

  loadAdminWallet(): Promise<void> {
    this.adminWalletLoading = true;
    return new Promise((resolve) => {
      this.financeService.getMyWallet().subscribe({
        next: (res) => {
          this.adminBalance = res?.data?.balance ?? 0;
          this.adminWalletLoading = false;
          this.cdr.detectChanges();
          resolve();
        },
        error: () => { this.adminWalletLoading = false; resolve(); },
      });
    });
  }

  async startAdminTopup(): Promise<void> {
    if (!this.adminSelectedPackage) {
      this.adminTopupError = 'Please select an amount.';
      return;
    }
    this.adminTopupProcessing = true;
    this.adminTopupSuccess = '';
    this.adminTopupError = '';
    try {
      const result = await this.financeService.startRazorpayWalletTopup(this.adminSelectedPackage, this.adminTopupMode);
      this.adminBalance = result.balance;
      this.adminTopupSuccess = `₹${this.adminSelectedPackage.toLocaleString('en-IN')} added to your admin wallet!`;
      this.adminSelectedPackage = null;
    } catch (err: any) {
      this.adminTopupError = err?.error?.message || err?.message || 'Payment could not be completed.';
    } finally {
      this.adminTopupProcessing = false;
      this.cdr.detectChanges();
    }
  }

  get isAdminBalanceInsufficient(): boolean {
    return !!this.rechargeModel.amount && this.rechargeModel.amount > this.adminBalance;
  }

  private loadStats(): Promise<void> {
    return new Promise((resolve) => {
      this.financeService.getAdminStats().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const d = res.data;
            this.paymentCards = [
              { title: 'Total Wallets Value',    value: '₹' + (d.totalWalletValue || 0).toLocaleString('en-IN'), icon: 'fas fa-wallet',      bgColor: '#DBEAFE', iconColor: 'rgb(11,74,111)' },
              { title: 'Total Admin Commission', value: '₹' + (d.totalCommission  || 0).toLocaleString('en-IN'), icon: 'fas fa-percent',      bgColor: '#DCFCE7', iconColor: '#16A34A' },
              { title: 'Successful Top-ups',     value: String(d.successTransactions || 0),                       icon: 'fas fa-exchange-alt', bgColor: '#FEF3C7', iconColor: '#D97706' },
              { title: 'Pending Refunds',        value: String(d.pendingRefunds      || 0),                       icon: 'fas fa-undo-alt',     bgColor: '#FEE2E2', iconColor: '#DC2626' },
            ];
          }
          this.cdr.detectChanges();
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadDistributors() {
    return new Promise<void>((resolve) => {
      this.financeService.listWallets({ limit: 100 }).subscribe({
        next: (res) => {
          this.distributors = (res?.data?.wallets ?? [])
            .filter((w: any) => w.userId?.role === 'DISTRIBUTOR')
            .map((w: any) => ({
              id: w.userId?._id ?? w._id,
              name: w.userId?.companyName ?? w.userId?.firstName ?? 'Unknown',
              balance: w.balance ?? 0,
              lastRechargeAmount: w.lastRechargeAmount ?? 0,
              lastRechargeDate: w.lastRechargeDate
                ? this.formatDateTime(w.lastRechargeDate)
                : 'N/A',
              status: w.isActive === false ? 'Inactive' : 'Active',
            }));
          this.cdr.detectChanges();
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadTransactions() {
    return new Promise<void>((resolve) => {
      this.financeService.listTransactions({ limit: 50 }).subscribe({
        next: (res) => {
          const DEBIT_TYPES = new Set(['DEBIT', 'CHARGE', 'SETTLEMENT', 'TRANSFER_DEBIT', 'DISPUTE_CHARGE', 'RTO_CHARGE']);
          this.payments = (res?.data?.transactions ?? []).map((t: any) => ({
            transactionId: t._id,
            displayId: (t._id as string)?.slice(-8)?.toUpperCase() ?? '—',
            distributor: t.userId?.companyName ?? t.userId?.firstName ?? 'Unknown',
            rechargeAmount: Math.abs(t.amount ?? 0),
            paymentMethod: t.type ?? 'Wallet',
            date: t.createdAt ? this.formatDateTime(t.createdAt) : '—',
            status: DEBIT_TYPES.has(t.type) ? 'Debit' : 'Credit',
          }));
          this.cdr.detectChanges();
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadRazorpayPayments() {
    this.rzpLoading = true;
    const params: any = { page: this.rzpPage, limit: this.rzpLimit };
    if (this.rzpFilter) params.status = this.rzpFilter;
    this.financeService.listPayments(params).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.payments ?? [];
        this.rzpTotal = res?.meta?.total ?? raw.length;
        this.razorpayPayments = raw.map((p: any) => ({
          id: p._id,
          userId: p.userId?._id ?? p.userId,
          userName: p.userId?.companyName ?? p.userId?.firstName ?? '—',
          userEmail: p.userId?.email ?? '—',
          date: this.formatDateTime(p.createdAt),
          amount: p.amountRupees ?? p.amount,
          method: p.paymentMethod ?? null,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId ?? null,
        }));
        this.rzpLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.rzpLoading = false; this.cdr.detectChanges(); },
    });
  }

  loadRefunds() {
    this.financeService.listRefunds({ limit: 50 }).subscribe({
      next: (res) => {
        this.refunds = (res?.data?.refunds ?? res?.data?.items ?? []).map((r: any) => ({
          refundId: r._id,
          displayId: (r._id as string)?.slice(-8)?.toUpperCase() ?? '—',
          user: r.userId?.companyName ?? r.userId?.firstName ?? 'Unknown',
          originalTxn: r.razorpayPaymentId
            ? (r.razorpayPaymentId as string).slice(-10)
            : (r.razorpayOrderId as string)?.slice(-10) ?? '—',
          amount: r.amountRupees ?? r.amount ?? 0,
          reason: r.metadata?.refund?.reason ?? r.failureReason ?? '—',
          date: r.capturedAt ?? r.createdAt
            ? this.formatDateTime(r.capturedAt ?? r.createdAt)
            : '—',
          status: r.status ?? 'REFUNDED',
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Refunds load failed', err),
    });
  }

  loadCommission() {
    this.financeService.listCommission({ limit: 50 }).subscribe({
      next: (res) => {
        this.commissionData = (res?.data?.commissions ?? res?.data?.items ?? []).map((c: any) => ({
          id: (c._id as string)?.slice(-8)?.toUpperCase() ?? '—',
          user: c.userId?.companyName ?? c.userId?.firstName ?? 'Unknown',
          amount: Math.abs(c.amount ?? 0),
          commission: c.commission ?? 0,
          date: c.createdAt ? this.formatDateTime(c.createdAt) : '—',
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Commission load failed', err),
    });
  }

  loadRechargeRequests() {
    this.financeService.listRechargeRequests({ limit: 50 }).subscribe({
      next: (res) => {
        this.rechargeRequestsData = (res?.data?.rechargeRequests ?? res?.data?.requests ?? []).map((r: any) => ({
          _id: r._id,
          displayId: (r._id as string)?.slice(-8)?.toUpperCase() ?? '—',
          distributorName: r.userId?.companyName ?? r.userId?.firstName ?? 'Unknown',
          amount: r.amount ?? 0,
          method: r.paymentMethod ?? 'UPI',
          reference: r.referenceId ?? '—',
          date: r.createdAt ? this.formatDateTime(r.createdAt) : '—',
          status: r.status ?? 'Pending',
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Recharge requests load failed', err),
    });
  }

  // ── Recharge Form ─────────────────────────────────────────────────────────

  quickRecharge(distributorId: string) {
    this.rechargeModel.distributorId = distributorId;
    this.activeTab = 'recharge';
    this.rechargeSuccess = '';
    this.rechargeError = '';
  }

  submitRecharge() {
    if (!this.rechargeModel.distributorId || !this.rechargeModel.amount) {
      this.rechargeError = 'Please fill in the distributor and amount fields.';
      return;
    }
    if (this.isAdminBalanceInsufficient) {
      this.rechargeError = `Insufficient admin wallet balance. Available: ₹${this.adminBalance.toLocaleString('en-IN')}. Please top up your wallet first.`;
      return;
    }
    this.isLoading = true;
    this.rechargeSuccess = '';
    this.rechargeError = '';
    this.financeService.rechargeDistributorWallet({
      distributorId: this.rechargeModel.distributorId,
      amount: Number(this.rechargeModel.amount),
      paymentMethod: this.rechargeModel.paymentMethod,
      referenceId: this.rechargeModel.referenceId,
    }).subscribe({
      next: () => {
        this.rechargeSuccess = `₹${this.rechargeModel.amount?.toLocaleString('en-IN')} transferred to distributor wallet successfully.`;
        this.rechargeModel = { distributorId: '', amount: null, paymentMethod: 'UPI' as const, referenceId: '' };
        this.activeTab = 'wallet';
        this.isLoading = false;
        this.loadAdminWallet();  // refresh admin balance
        this.loadDistributors(); // refresh distributor balances
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rechargeError = err?.error?.message ?? 'Transfer failed. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Recharge Requests ─────────────────────────────────────────────────────

  get rechargeRequests() { return this.rechargeRequestsData; }

  approveRequest(req: any) {
    this.rechargeRequestSuccess = '';
    this.rechargeRequestError   = '';
    this.rechargeRequestActionInProgress = req._id;

    this.financeService.approveRechargeRequest(req._id).subscribe({
      next: () => {
        this.rechargeRequestActionInProgress = '';
        this.rechargeRequestSuccess = `₹${req.amount.toLocaleString('en-IN')} approved and credited to ${req.distributorName}'s wallet.`;
        this.loadRechargeRequests();
        this.loadAdminWallet();
        this.loadDistributors();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rechargeRequestActionInProgress = '';
        this.rechargeRequestError = err?.error?.message ?? 'Approval failed. Please check your admin wallet balance.';
        this.cdr.detectChanges();
      },
    });
  }

  openRejectForm(req: any) {
    this.rejectingRequestId   = req._id;
    this.rejectReasonInput    = '';
    this.rechargeRequestError = '';
    this.rechargeRequestSuccess = '';
  }

  cancelRejectForm() {
    this.rejectingRequestId = '';
    this.rejectReasonInput  = '';
  }

  confirmRejectRequest(req: any) {
    if (!this.rejectReasonInput.trim() || this.rejectReasonInput.trim().length < 5) {
      this.rechargeRequestError = 'Please provide a rejection reason of at least 5 characters.';
      return;
    }
    this.rechargeRequestActionInProgress = req._id;
    this.rechargeRequestError = '';

    this.financeService.rejectRechargeRequest(req._id, this.rejectReasonInput.trim()).subscribe({
      next: () => {
        this.rechargeRequestActionInProgress = '';
        this.rejectingRequestId = '';
        this.rechargeRequestSuccess = `Recharge request from ${req.distributorName} rejected.`;
        this.loadRechargeRequests();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rechargeRequestActionInProgress = '';
        this.rechargeRequestError = err?.error?.message ?? 'Rejection failed. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  rejectRequest(req: any) {
    this.openRejectForm(req);
  }

  // ── Razorpay Payments ─────────────────────────────────────────────────────

  get rzpTotalPages() { return Math.ceil(this.rzpTotal / this.rzpLimit); }

  prevRzpPage() { if (this.rzpPage > 1) { this.rzpPage--; this.loadRazorpayPayments(); } }
  nextRzpPage() { if (this.rzpPage < this.rzpTotalPages) { this.rzpPage++; this.loadRazorpayPayments(); } }

  applyRzpFilter() { this.rzpPage = 1; this.loadRazorpayPayments(); }

  openRefundModal(payment: any) {
    this.refundPayment = payment;
    this.refundReason = '';
    this.refundAmount = null;
    this.showRefundModal = true;
  }

  closeRefundModal() {
    if (this.refundProcessing) return;
    this.showRefundModal = false;
    this.refundPayment = null;
  }

  submitRefund() {
    if (!this.refundReason.trim() || !this.refundPayment) return;
    this.refundProcessing = true;
    this.financeService.refundRazorpayPayment(
      this.refundPayment.id,
      this.refundReason,
      this.refundAmount ?? undefined,
    ).subscribe({
      next: () => {
        this.refundProcessing = false;
        this.closeRefundModal();
        alert('Refund processed successfully.');
        this.loadRazorpayPayments();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err?.error?.message ?? 'Refund failed.');
        this.refundProcessing = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  get successfulPayments() { return this.payments.filter(p => p.status === 'Credit'); }

  private formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
