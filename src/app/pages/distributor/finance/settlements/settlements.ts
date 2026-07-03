import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../../services/finance.service';

export interface Settlement {
  id: string;
  displayId: string;
  user: string;
  date: string;
  amount: number;
  status: string;
  reference: string;
  type: string;
}

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settlements.html',
  styleUrl: './settlements.css',
})
export class Settlements implements OnInit {
  private financeService = inject(FinanceService);

  settlements: Settlement[] = [];
  filteredSettlements: Settlement[] = [];
  isLoading = false;

  searchTerm = '';
  statusFilter = 'All';

  // Create settlement form
  showForm = false;
  newSettlement = { userId: '', amount: null as number | null, note: '' };
  isSubmitting = false;
  formError = '';
  formSuccess = '';

  // Wallets for dropdown (merchants under this distributor)
  wallets: any[] = [];

  ngOnInit() { this.loadSettlements(); this.loadWallets(); }

  loadSettlements() {
    this.isLoading = true;
    this.financeService.listSettlements({ limit: 100 }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.settlements ?? res?.data?.items ?? [];
        this.settlements = raw.map((s: any) => ({
          id: s._id,
          displayId: (s._id as string)?.slice(-8)?.toUpperCase() ?? '—',
          user: s.userId?.companyName ?? s.userId?.firstName ?? 'Unknown',
          date: s.createdAt
            ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
          amount: s.amount ?? 0,
          status: s.status ?? 'PENDING',
          reference: s.reference ?? '—',
          type: s.type ?? 'SETTLEMENT',
        }));
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load settlements', err);
        this.isLoading = false;
      },
    });
  }

  loadWallets() {
    this.financeService.listWallets({ limit: 100 }).subscribe({
      next: (res) => {
        this.wallets = (res?.data?.wallets ?? [])
          .filter((w: any) => w.userId?.role === 'MERCHANT')
          .map((w: any) => ({
            id: w.userId?._id,
            name: w.userId?.companyName ?? w.userId?.firstName ?? 'Unknown',
          }));
      },
      error: () => {},
    });
  }

  applyFilters() {
    const q = this.searchTerm.toLowerCase();
    this.filteredSettlements = this.settlements.filter((s) => {
      const matchesSearch = !q || s.user.toLowerCase().includes(q) || s.displayId.toLowerCase().includes(q);
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  openForm() {
    this.showForm = true;
    this.formError = '';
    this.formSuccess = '';
    this.newSettlement = { userId: '', amount: null, note: '' };
  }

  closeForm() { this.showForm = false; }

  submitSettlement() {
    if (!this.newSettlement.userId || !this.newSettlement.amount || this.newSettlement.amount <= 0) {
      this.formError = 'Please select a merchant and enter a valid amount.';
      return;
    }
    this.isSubmitting = true;
    this.formError = '';
    this.financeService.createSettlement({
      toUserId: this.newSettlement.userId,
      amount: this.newSettlement.amount,
      reference: this.newSettlement.note || undefined,
    }).subscribe({
      next: () => {
        this.formSuccess = 'Settlement created successfully.';
        this.isSubmitting = false;
        this.newSettlement = { userId: '', amount: null, note: '' };
        this.loadSettlements();
        setTimeout(() => { this.showForm = false; this.formSuccess = ''; }, 2000);
      },
      error: (err) => {
        this.formError = err?.error?.message ?? 'Failed to create settlement.';
        this.isSubmitting = false;
      },
    });
  }

  get totalSettled(): number {
    return this.settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.amount, 0);
  }

  get pendingCount(): number {
    return this.settlements.filter(s => s.status === 'PENDING').length;
  }
}
