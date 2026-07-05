import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FinanceService } from '../../../../services/finance.service';
import { CsvExportService } from '../../../../shared/csv-export.service';

interface MerchantRow {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  codEscrow: number;
  status: string;
}

@Component({
  selector: 'app-merchant-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-revenue.html',
})
export class MerchantRevenueReport implements OnInit {
  private financeService = inject(FinanceService);
  private csvService     = inject(CsvExportService);

  isLoading   = false;
  error       = '';
  searchTerm  = '';

  data: MerchantRow[]         = [];
  filteredData: MerchantRow[] = [];

  get totalBalance(): number { return this.data.reduce((s, d) => s + d.walletBalance, 0); }
  get totalEscrow():  number { return this.data.reduce((s, d) => s + d.codEscrow, 0); }
  get activeCount():  number { return this.data.filter(d => d.status === 'Active').length; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    this.financeService.listWallets({ limit: 200 }).pipe(catchError(() => of(null))).subscribe({
      next: (res) => {
        const wallets: any[] = res?.data?.wallets ?? [];
        this.data = wallets
          .filter((w: any) => w.userId?.role === 'MERCHANT')
          .map((w: any): MerchantRow => ({
            id:            w.userId?._id ?? w._id,
            name:          w.userId?.companyName ?? w.userId?.firstName ?? 'Unknown',
            email:         w.userId?.email ?? '—',
            walletBalance: w.balance ?? 0,
            codEscrow:     w.codEscrowBalance ?? 0,
            status:        w.isActive === false ? 'Inactive' : 'Active',
          }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load merchant data.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.filteredData = q
      ? this.data.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q))
      : [...this.data];
  }

  exportCSV(): void {
    const headers = ['Merchant', 'Email', 'Wallet Balance', 'COD Escrow', 'Status'];
    const rows = this.filteredData.map(d => [d.name, d.email, d.walletBalance, d.codEscrow, d.status]);
    this.csvService.export('merchant_wallet_report', headers, rows);
  }
}
