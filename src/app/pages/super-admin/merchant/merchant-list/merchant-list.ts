import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './merchant-list.html',
  styleUrl: './merchant-list.css'
})
export class Merchant implements OnInit, OnDestroy {
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── Remote state (from API) ──────────────────────────────────────────────────
  merchants = signal<MerchantUser[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Pagination — backend meta keys are: total, page, limit, pages
  currentPage = signal(1);
  readonly pageLimit = 20;
  totalCount = signal(0);
  totalPages = signal(1);

  // ── Local UI state ───────────────────────────────────────────────────────────
  /**
   * Status filter — CLIENT-SIDE ONLY.
   *
   * The backend /users endpoint does NOT accept an isActive query param.
   * The filter is applied on the already-loaded page of results.
   */
  statusFilter = 'All';

  // Search is debounced and triggers a backend call (page resets to 1)
  private _searchQuery = '';
  get searchQuery(): string { return this._searchQuery; }
  set searchQuery(value: string) {
    this._searchQuery = value;
    this.searchSubject.next(value);
  }

  // ── Derived counts ───────────────────────────────────────────────────────────
  /** Total from backend — reflects all merchants, not just this page. */
  get totalMerchants() { return this.totalCount(); }

  /** Active count on the current loaded page. */
  get activeMerchantsOnPage() { return this.merchants().filter(m => m.isActive).length; }

  /** Inactive count on the current loaded page (excluding not activated users). */
  get inactiveMerchantsOnPage() {
    return this.merchants().filter(m => !m.isActive && !this.isNotActivated(m)).length;
  }

  /** Not activated count on the current loaded page. */
  get notActivatedMerchantsOnPage() { return this.merchants().filter(m => this.isNotActivated(m)).length; }

  /**
   * Client-side status filter applied on top of the backend result.
   * When 'All': shows everything.
   * When 'Active': shows only active merchants (excluding not activated).
   * When 'Inactive': shows only inactive merchants (excluding not activated).
   * When 'NotActivated': shows merchants who haven't set password or logged in.
   */
  get filteredMerchants(): MerchantUser[] {
    if (this.statusFilter === 'All') return this.merchants();
    if (this.statusFilter === 'Active') return this.merchants().filter(m => m.isActive && !this.isNotActivated(m));
    if (this.statusFilter === 'Inactive') return this.merchants().filter(m => !m.isActive && !this.isNotActivated(m));
    if (this.statusFilter === 'NotActivated') return this.merchants().filter(m => this.isNotActivated(m));
    return this.merchants();
  }

  /** True when status filter is narrowing the visible rows. */
  get isStatusFiltered(): boolean { return this.statusFilter !== 'All'; }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadMerchants();
    });

    this.loadMerchants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data fetching ────────────────────────────────────────────────────────────
  loadMerchants(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.merchantService.listMerchants({
      search: this._searchQuery.trim() || undefined,
      page: this.currentPage(),
      limit: this.pageLimit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.merchants.set(res.data.users);
        this.totalCount.set(res.meta.total);
        this.totalPages.set(res.meta.pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load merchants. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Pagination ───────────────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMerchants();
  }

  get pagesArray(): number[] {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const cur = this.currentPage();
    const pages = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  viewMerchant(id: string): void {
    this.router.navigate(['/super-admin/merchants/profile', id]);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getInitials(firstName: string, lastName: string, companyName?: string): string {
    const src = companyName || `${firstName} ${lastName}`;
    return src.split(' ')
      .map(p => p.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'M';
  }

  getDisplayName(merchant: MerchantUser): string {
    return merchant.companyName || `${merchant.firstName} ${merchant.lastName}`;
  }

  getStatusLabel(merchant: MerchantUser): string {
    // If not activated, show that status instead of active/inactive
    if (this.isNotActivated(merchant)) {
      if (merchant.mustChangeCredentials) return 'Not Set Password';
      if (!merchant.lastLoginAt) return 'Not Activated';
    }
    return merchant.isActive ? 'Active' : 'Inactive';
  }

  isNotActivated(merchant: MerchantUser): boolean {
    // User is not activated if they must change credentials or have never logged in
    return merchant.mustChangeCredentials || !merchant.lastLoginAt;
  }

  getActivationStatus(merchant: MerchantUser): string {
    if (!merchant.isActive) return 'Inactive';
    if (merchant.mustChangeCredentials) return 'Not Set Password';
    if (!merchant.lastLoginAt) return 'Not Activated';
    return 'Active';
  }
}
