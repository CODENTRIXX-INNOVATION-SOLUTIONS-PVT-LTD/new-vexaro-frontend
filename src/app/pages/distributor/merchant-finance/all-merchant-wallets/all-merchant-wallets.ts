import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';

@Component({
  selector: 'app-all-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './all-merchant-wallets.html',
  styleUrl: './all-merchant-wallets.css',
})
export class AllMerchantWallets implements OnInit {
  private financeService = inject(FinanceService);

  // ── Wallets ───────────────────────────────────────────────────────────────
  merchantWallets: any[] = [];
  filteredWallets: any[] = [];
  searchTerm = '';
  isLoading = false;
  totalBalance = 0;

  // ── Pending top-up requests from merchants ────────────────────────────────
  pendingRequests: any[] = [];
  requestsLoading = false;
  actionInProgressId = '';
  rejectReason = '';
  rejectingId = '';
  actionSuccess = '';
  actionError = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadWallets();
    this.loadPendingRequests();
  }

  // ── Wallets ───────────────────────────────────────────────────────────────

  loadWallets(): void {
    this.isLoading = true;
    this.financeService.listWallets({ limit: 200 }).subscribe({
      next: (res) => {
        const all: any[] = res?.data?.wallets ?? [];
        this.merchantWallets = all
          .filter((w: any) => w.userId?.role === 'MERCHANT')
          .map((w: any) => ({
            id:           w.userId?._id ?? w._id,
            businessName: w.userId?.companyName ?? w.userId?.firstName ?? 'Unknown',
            merchantCode: w.userId?.merchantCode ?? w.userId?._id?.slice(-6)?.toUpperCase() ?? '—',
            balance:      w.balance ?? 0,
            codEscrow:    w.codEscrowBalance ?? 0,
            status:       w.isActive === false ? 'Suspended' : 'Active',
            email:        w.userId?.email ?? '—',
          }));
        this.totalBalance = this.merchantWallets.reduce((s, w) => s + w.balance, 0);
        this.isLoading = false;
        this.applyFilters();
      },
      error: () => { this.isLoading = false; },
    });
  }

  applyFilters(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredWallets = q
      ? this.merchantWallets.filter(
          w => w.businessName.toLowerCase().includes(q) ||
               w.merchantCode.toLowerCase().includes(q) ||
               w.email.toLowerCase().includes(q),
        )
      : [...this.merchantWallets];
  }

  // ── Pending top-up requests ───────────────────────────────────────────────

  loadPendingRequests(): void {
    this.requestsLoading = true;
    this.financeService.listMerchantRechargeRequests({ status: 'PENDING', limit: 50 }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.requests ?? [];
        this.pendingRequests = raw.map((r: any) => ({
          id:           r._id,
          date:         new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          merchantName: r.merchantId?.companyName ?? r.merchantId?.firstName ?? '—',
          merchantEmail: r.merchantId?.email ?? '—',
          amount:       r.amount ?? 0,
          note:         r.note ?? '—',
          status:       r.status,
        }));
        this.requestsLoading = false;
      },
      error: () => { this.requestsLoading = false; },
    });
  }

  get pendingCount(): number {
    return this.pendingRequests.filter(r => r.status === 'PENDING').length;
  }

  approveRequest(requestId: string): void {
    this.actionInProgressId = requestId;
    this.actionSuccess = '';
    this.actionError   = '';

    this.financeService.approveMerchantRechargeRequest(requestId).subscribe({
      next: () => {
        this.actionInProgressId = '';
        const req = this.pendingRequests.find(r => r.id === requestId);
        this.actionSuccess = `₹${req?.amount?.toLocaleString('en-IN')} transferred to ${req?.merchantName} successfully.`;
        // Remove from pending list and refresh wallet balances
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
        this.loadWallets();
      },
      error: (err) => {
        this.actionInProgressId = '';
        this.actionError = err?.error?.message ?? 'Failed to approve request. Check your wallet balance.';
      },
    });
  }

  openReject(requestId: string): void {
    this.rejectingId  = requestId;
    this.rejectReason = '';
    this.actionError  = '';
    this.actionSuccess = '';
  }

  cancelReject(): void {
    this.rejectingId  = '';
    this.rejectReason = '';
  }

  confirmReject(requestId: string): void {
    this.actionInProgressId = requestId;
    this.actionError   = '';
    this.actionSuccess = '';

    this.financeService.rejectMerchantRechargeRequest(requestId, this.rejectReason || undefined).subscribe({
      next: () => {
        this.actionInProgressId = '';
        this.rejectingId        = '';
        const req = this.pendingRequests.find(r => r.id === requestId);
        this.actionSuccess = `Request from ${req?.merchantName} rejected.`;
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
      },
      error: (err) => {
        this.actionInProgressId = '';
        this.actionError = err?.error?.message ?? 'Failed to reject request.';
      },
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  topupMerchant(merchantId: string): void {
    this.router.navigate(['/distributor/merchant-finance/topup'], { queryParams: { merchantId } });
  }

  viewTransactions(merchantId: string): void {
    this.router.navigate(['/distributor/merchant-finance/transactions'], { queryParams: { merchantId } });
  }

  viewMerchant(merchantId: string): void {
    this.router.navigate(['/distributor/merchants', merchantId]);
  }
}
