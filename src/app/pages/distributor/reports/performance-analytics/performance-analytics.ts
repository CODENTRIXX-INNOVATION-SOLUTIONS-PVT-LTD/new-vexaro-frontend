import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CsvExportService } from '../../../../shared/csv-export.service';

interface MetricRow {
  name: string;
  value: string;
  note: string;
}

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-analytics.html',
  styleUrl: './performance-analytics.css',
})
export class PerformanceAnalytics implements OnInit {
  private http       = inject(HttpClient);
  private csvService = inject(CsvExportService);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = false;
  error     = '';

  // Summary cards
  totalShipments  = 0;
  deliveredCount  = 0;
  rtoCount        = 0;
  failedCount     = 0;
  todayCount      = 0;
  openDisputes    = 0;
  walletBalance   = 0;
  activeMerchants = 0;

  get deliveryRate(): string {
    if (!this.totalShipments) return '—';
    return ((this.deliveredCount / this.totalShipments) * 100).toFixed(1) + '%';
  }

  get rtoRate(): string {
    if (!this.totalShipments) return '—';
    return ((this.rtoCount / this.totalShipments) * 100).toFixed(1) + '%';
  }

  metrics: MetricRow[] = [];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const stats$     = this.http.get<any>(`${this.base}/shipments/stats`).pipe(catchError(() => of(null)));
    const merchants$ = this.http.get<any>(`${this.base}/users`,
      { params: new HttpParams().set('role', 'MERCHANT').set('limit', '1') }
    ).pipe(catchError(() => of(null)));
    const disputes$  = this.http.get<any>(`${this.base}/disputes`,
      { params: new HttpParams().set('limit', '1').set('status', 'OPEN') }
    ).pipe(catchError(() => of(null)));
    const wallet$    = this.http.get<any>(`${this.base}/finance/wallet`).pipe(catchError(() => of(null)));

    forkJoin([stats$, merchants$, disputes$, wallet$]).subscribe({
      next: ([statsRes, merchantsRes, disputesRes, walletRes]) => {
        const s = statsRes?.data ?? statsRes;

        this.totalShipments  = s?.total    ?? 0;
        this.todayCount      = s?.today    ?? 0;
        this.deliveredCount  = s?.byStatus?.DELIVERED       ?? 0;
        this.rtoCount        = s?.byStatus?.RTO             ?? 0;
        this.failedCount     = s?.byStatus?.DELIVERY_FAILED ?? 0;
        this.activeMerchants = merchantsRes?.meta?.total    ?? 0;
        this.openDisputes    = disputesRes?.meta?.total     ?? 0;
        this.walletBalance   = walletRes?.data?.balance     ?? 0;

        this.metrics = [
          { name: 'Total Shipments',      value: this.totalShipments.toLocaleString('en-IN'), note: 'All time' },
          { name: "Today's Bookings",     value: this.todayCount.toLocaleString('en-IN'),      note: 'Created today' },
          { name: 'Delivered',            value: this.deliveredCount.toLocaleString('en-IN'),  note: '' },
          { name: 'Delivery Rate',        value: this.deliveryRate,                             note: 'Delivered / Total' },
          { name: 'RTO',                  value: this.rtoCount.toLocaleString('en-IN'),         note: '' },
          { name: 'RTO Rate',             value: this.rtoRate,                                  note: 'RTO / Total' },
          { name: 'Delivery Failed',      value: this.failedCount.toLocaleString('en-IN'),      note: '' },
          { name: 'Active Merchants',     value: this.activeMerchants.toLocaleString('en-IN'),  note: '' },
          { name: 'Open Disputes',        value: this.openDisputes.toLocaleString('en-IN'),     note: '' },
          { name: 'Wallet Balance',       value: '₹' + this.walletBalance.toLocaleString('en-IN'), note: '' },
        ];

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load analytics.';
        this.isLoading = false;
      },
    });
  }

  exportCSV(): void {
    const headers = ['Metric', 'Value', 'Note'];
    const rows = this.metrics.map(m => [m.name, m.value, m.note]);
    this.csvService.export('distributor_performance_analytics', headers, rows);
  }
}
