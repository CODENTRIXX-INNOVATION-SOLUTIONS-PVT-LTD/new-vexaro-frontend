import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FinanceService } from '../../../../services/finance.service';
import { UserService } from '../../../../services/user.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination';

@Component({
  selector: 'app-all-merchant-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
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
  page = 1;
  readonly limit = 20;

  get totalPages(): number { return Math.ceil(this.filteredWallets.length / this.limit) || 1; }
  get pagedWallets(): any[] {
    const start = (this.page - 1) * this.limit;
    return this.filteredWallets.slice(start, start + this.limit);
  }

  // ── Pending top-up requests from merchants ────────────────────────────────
  pendingRequests: any[] = [];
  requestsLoading = false;
  actionInProgressId = '';
  rejectReason = '';
  rejectingId = '';
  actionSuccess = '';
  actionError = '';
  isSuperAdminPortal = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.isSuperAdminPortal = this.router.url.startsWith('/super-admin');

    // Pre-fill searchTerm from URL query param (e.g. ?search=acme)
    const initialSearch = this.route.snapshot.queryParams['search'] ?? '';
    if (initialSearch) {
      this.searchTerm = initialSearch;
    }

    this.loadWallets();
    this.loadPendingRequests();
  }

  get pageSubtitle(): string {
    return this.isSuperAdminPortal
      ? 'View and manage wallet balances for all merchants'
      : 'View and manage wallet balances for all your merchants';
  }

  get pendingRequestsTitle(): string {
    return this.isSuperAdminPortal ? 'Merchant Requests to Super Admin' : 'Merchant Top-up Requests';
  }

  get pendingRequestsSubtitle(): string {
    return this.isSuperAdminPortal
      ? 'Direct merchants requesting wallet funds from Super Admin. Approving deducts from the admin wallet.'
      : 'Merchants requesting wallet funds from you. Approving deducts from your wallet.';
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
    this.page = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
  }

  // ── Pending top-up requests ───────────────────────────────────────────────

  loadPendingRequests(): void {
    this.requestsLoading = true;
    const params: { status: string; limit: number; directOnly?: boolean } = { status: 'PENDING', limit: 50 };
    if (this.isSuperAdminPortal) params.directOnly = true;
    this.financeService.listMerchantRechargeRequests(params).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.requests ?? [];
        this.pendingRequests = raw.map((r: any) => ({
          id:           r._id,
          date:         new Date(r.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
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
    this.router.navigate([`${this.merchantFinanceBaseRoute}/topup`], { queryParams: { merchantId } });
  }

  viewTransactions(merchantId: string): void {
    this.router.navigate([`${this.merchantFinanceBaseRoute}/transactions`], { queryParams: { merchantId } });
  }

  viewMerchant(merchantId: string): void {
    if (this.isSuperAdminPortal) {
      this.router.navigate(['/super-admin/merchants/profile', merchantId]);
      return;
    }

    this.router.navigate(['/distributor/merchants', merchantId]);
  }

  private get merchantFinanceBaseRoute(): string {
    return this.isSuperAdminPortal ? '/super-admin/merchant-finance' : '/distributor/merchant-finance';
  }
}
