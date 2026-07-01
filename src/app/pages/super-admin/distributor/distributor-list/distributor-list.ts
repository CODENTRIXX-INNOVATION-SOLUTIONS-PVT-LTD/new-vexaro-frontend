import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { AddDistributorModal } from '../../../../models/add-distributor-modal/add-distributor-modal';
import { DistributorCreatedSuccess } from '../../../../models/distributor-created-success/distributor-created-success';
import { MerchantService, MerchantUser } from '../../../../services/merchant.service';

@Component({
  selector: 'app-distributor-list',
  imports: [RouterLink, AddDistributorModal, DistributorCreatedSuccess, CommonModule, FormsModule],
  templateUrl: './distributor-list.html',
  styleUrl: './distributor-list.css'
})
export class DistributorList implements OnInit, OnDestroy {
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── Remote state ─────────────────────────────────────────────────────────────
  distributors = signal<MerchantUser[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  // Pagination
  currentPage = signal(1);
  readonly pageLimit = 20;
  totalCount = signal(0);
  totalPages = signal(1);

  // ── Modal state (kept from original) ─────────────────────────────────────────
  showModal = false;
  showAddModal = false;
  showSuccessModal = false;

  // ── Search (debounced, triggers backend call) ─────────────────────────────────
  private _searchQuery = '';
  get searchQuery(): string { return this._searchQuery; }
  set searchQuery(value: string) {
    this._searchQuery = value;
    this.searchSubject.next(value);
  }

  // ── Derived counts ────────────────────────────────────────────────────────────
  get totalDistributors()    { return this.totalCount(); }
  get activeDistributors()   { return this.distributors().filter(d => d.isActive).length; }
  get inactiveDistributors() { return this.distributors().filter(d => !d.isActive).length; }

  // Status filter — client-side on current page (backend has no isActive param)
  statusFilter = 'All';
  get filteredDistributors(): MerchantUser[] {
    if (this.statusFilter === 'All') return this.distributors();
    const wantActive = this.statusFilter === 'Active';
    return this.distributors().filter(d => d.isActive === wantActive);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadDistributors();
    });
    this.loadDistributors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ──────────────────────────────────────────────────────────────
  loadDistributors(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.merchantService.listDistributors({
      search: this._searchQuery.trim() || undefined,
      page: this.currentPage(),
      limit: this.pageLimit,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.distributors.set(res.data.users);
        this.totalCount.set(res.meta.total);
        this.totalPages.set(res.meta.pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load distributors. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadDistributors();
  }

  get pagesArray(): number[] {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const cur = this.currentPage();
    const pages = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  viewDistributor(id: string): void {
    this.router.navigate(['/super-admin/distributors/profile', id]);
  }

  onDistributorSaved(): void {
    this.showAddModal = false;
    this.showSuccessModal = true;
    this.loadDistributors(); // refresh after adding
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  getInitials(firstName: string, lastName: string, companyName?: string): string {
    const src = companyName || `${firstName} ${lastName}`;
    return src.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase() || 'D';
  }

  getDisplayName(d: MerchantUser): string {
    return d.companyName || `${d.firstName} ${d.lastName}`;
  }
}
