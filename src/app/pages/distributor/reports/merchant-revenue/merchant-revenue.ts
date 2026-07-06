import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { CsvExportService } from '../../../../shared/csv-export.service';

interface MerchantRow {
  id: string;
  name: string;
  email: string;
  totalShipments: number;
  delivered: number;
  failed: number;
  codTotal: number;
  deliveryRate: string;
}

@Component({
  selector: 'app-merchant-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-revenue.html',
  styleUrl: './merchant-revenue.css',
})
export class MerchantRevenueReport implements OnInit, OnDestroy {
  private http       = inject(HttpClient);
  private csvService = inject(CsvExportService);
  private destroy$   = new Subject<void>();
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading  = false;
  error      = '';
  searchTerm = '';

  data: MerchantRow[]         = [];
  filteredData: MerchantRow[] = [];

  get totalShipments(): number { return this.data.reduce((s, d) => s + d.totalShipments, 0); }
  get totalDelivered(): number { return this.data.reduce((s, d) => s + d.delivered, 0); }
  get totalCOD():       number { return this.data.reduce((s, d) => s + d.codTotal, 0); }

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    this.http.get<any>(`${this.base}/reports/merchant-revenue`)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res) => {
          // Response: { data: [ { merchant: {...}, shipments: { total, delivered, failed, codTotal } } ] }
          const raw: any[] = res?.data ?? [];
          this.data = raw.map((item: any): MerchantRow => {
            const m  = item.merchant;
            const s  = item.shipments;
            const total = s?.total ?? 0;
            const del   = s?.delivered ?? 0;
            return {
              id:             m.id ?? m._id,
              name:           m.companyName || `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || '—',
              email:          m.email ?? '—',
              totalShipments: total,
              delivered:      del,
              failed:         s?.failed ?? 0,
              codTotal:       s?.codTotal ?? 0,
              deliveryRate:   total > 0 ? ((del / total) * 100).toFixed(1) + '%' : '—',
            };
          });
          this.applyFilters();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load merchant revenue report.';
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
    const headers = ['Merchant', 'Email', 'Total Shipments', 'Delivered', 'Failed', 'Delivery Rate', 'COD Total'];
    const rows = this.filteredData.map(d => [
      d.name, d.email, d.totalShipments, d.delivered, d.failed, d.deliveryRate, d.codTotal,
    ]);
    this.csvService.export('merchant_revenue_report', headers, rows);
  }
}
