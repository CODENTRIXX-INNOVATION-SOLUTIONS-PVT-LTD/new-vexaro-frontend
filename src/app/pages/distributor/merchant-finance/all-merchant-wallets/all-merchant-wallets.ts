import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FinanceService } from '../../../../services/finance.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-all-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-merchant-wallets.html',
  styleUrl: './all-merchant-wallets.css',
})
export class AllMerchantWallets implements OnInit {
  private financeService = inject(FinanceService);
  private userService = inject(UserService);

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Pre-fill searchTerm from URL query param (e.g. ?search=acme)
    const initialSearch = this.route.snapshot.queryParams['search'] ?? '';
    if (initialSearch) {
      this.searchTerm = initialSearch;
    }

    this.loadWallets();
    this.loadPendingRequests();
  }

  // ── Wallets ───────────────────────────────────────────────────────────────

  loadWallets(): void {
    this.isLoading = true;

    const wallets$ = this.financeService.listWallets({ limit: 100 }).pipe(
      catchError((err) => {
        console.error('[MerchantWallets] Wallet API error:', err);
        return of(null);
      })
    );

    const merchants$ = this.userService.listUsers({ role: 'MERCHANT', limit: 100 }).pipe(
      catchError((err) => {
        console.error('[MerchantWallets] User API error:', err);
        return of(null);
      })
    );

    forkJoin([wallets$, merchants$]).subscribe({
      next: ([walletsRes, merchantsRes]) => {
        console.log('[MerchantWallets] Wallets API response:', walletsRes);
        console.log('[MerchantWallets] Merchants API response:', merchantsRes);

        const wallets: any[] = walletsRes?.data?.wallets ?? [];
        const users: any[] = merchantsRes?.data?.users ?? [];

        // Build a map of wallet data keyed by userId
        const walletMap = new Map<string, any>();
        wallets.forEach((w: any) => {
          const uid = w.userId?._id ?? w.userId?.id ?? w._id ?? w.id;
          if (uid) {
            walletMap.set(uid.toString(), w);
          }
        });

        // Map every merchant user to a list item, matching their wallet if exists
        this.merchantWallets = users.map((u: any) => {
          const uid = u.id ?? u._id;
          const wallet = uid ? walletMap.get(uid.toString()) : null;
          return {
            id:           uid,
            businessName: (u.companyName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || 'Unknown',
            merchantCode: u.merchantCode ?? uid?.toString().slice(-6).toUpperCase() ?? '—',
            balance:      wallet?.balance ?? 0,
            status:       (u.deletedAt || u.isActive === false) ? 'Suspended' : 'Active',
            email:        u.email ?? '—',
          };
        });

        this.totalBalance = this.merchantWallets.reduce((s, w) => s + w.balance, 0);
        this.isLoading = false;
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.filteredWallets = q
      ? this.merchantWallets.filter(
          w =>
            w.businessName.toLowerCase().includes(q) ||
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
