import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CsvExportService } from '../../../shared/csv-export.service';

@Component({
  selector: 'app-merchant-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  private http       = inject(HttpClient);
  private csvService = inject(CsvExportService);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = false;
  error     = '';

  // Template binds to these filter fields
  dateRange     = 'This Month';
  statusFilter  = 'All Statuses';
  carrierFilter = 'All Carriers';

  // Template uses summary.weightDisputes, summary.codPerformance, summary.walletSpend
  summary = {
    total: 0, delivered: 0, failed: 0, rto: 0,
    inTransit: 0, pending: 0, totalCost: 0,
    weightDisputes: 0, codPerformance: 0, walletSpend: 0,
  };

  dataList: any[] = [];

  get deliveryRate(): string {
    if (!this.summary.total) return '—';
    return ((this.summary.delivered / this.summary.total) * 100).toFixed(1) + '%';
  }

  ngOnInit(): void { this.loadReport(); }

  // Template calls loadReport() from filter dropdowns
  loadReport(): void {
    this.isLoading = true;
    this.error     = '';

    const stats$   = this.http.get<any>(`${this.base}/shipments/stats`)
      .pipe(catchError(() => of(null)));
    const recent$  = this.http.get<any>(`${this.base}/shipments`,
      { params: new HttpParams().set('limit', '10').set('page', '1') })
      .pipe(catchError(() => of(null)));
    const disputes$ = this.http.get<any>(`${this.base}/disputes`,
      { params: new HttpParams().set('limit', '1') })
      .pipe(catchError(() => of(null)));

    forkJoin([stats$, recent$, disputes$]).subscribe({
      next: ([statsRes, recentRes, disputesRes]) => {
        const s  = statsRes?.data ?? statsRes;
        const by = s?.byStatus ?? {};

        this.summary = {
          total:          s?.total    ?? 0,
          delivered:      by.DELIVERED       ?? 0,
          failed:         by.DELIVERY_FAILED  ?? 0,
          rto:            by.RTO             ?? 0,
          inTransit:      (by.PICKED_UP ?? 0) + (by.ARRIVED_AT_HUB ?? 0) + (by.OUT_FOR_DELIVERY ?? 0),
          pending:        by.ORDER_CREATED   ?? 0,
          totalCost:      s?.totalCost       ?? 0,
          weightDisputes: disputesRes?.meta?.total ?? 0,
          codPerformance: s?.total ? +((by.DELIVERED ?? 0) / s.total * 100).toFixed(1) : 0,
          walletSpend:    s?.totalCost ?? 0,
        };

        this.dataList = (recentRes?.data?.shipments ?? []).map((sh: any) => ({
          date:     new Date(sh.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          awb:      sh.awb,
          status:   sh.status,
          dest:     sh.destination?.city ?? '—',
          carrier:  sh.carrier ?? '—',
          weight:   sh.weight ?? 0,
          total:    sh.merchantCost ?? 0,
          delivered: sh.status === 'DELIVERED' ? 1 : 0,
          failed:   sh.status === 'DELIVERY_FAILED' ? 1 : 0,
          rto:      sh.status === 'RTO' ? 1 : 0,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load report.';
        this.isLoading = false;
      },
    });
  }

  exportCSV(): void {
    const headers = ['Date', 'AWB', 'Status', 'Destination', 'Carrier', 'Weight (kg)', 'Charge (₹)'];
    const rows = this.dataList.map(s => [s.date, s.awb, s.status, s.dest, s.carrier, s.weight, s.total]);
    this.csvService.export('merchant_shipment_report', headers, rows);
  }

  exportPDF(): void {
    const win = window.open('', '_blank');
    if (!win) return;

    const rowsHtml = this.dataList.map(s => `
      <tr>
        <td>${s.date}</td><td>${s.awb}</td><td>${s.status}</td>
        <td>${s.dest}</td><td>${s.carrier}</td>
        <td style="text-align:right;">${s.weight} kg</td>
        <td style="text-align:right;">₹${(s.total ?? 0).toFixed(2)}</td>
      </tr>`).join('');

    win.document.write(`<html><head><title>Merchant Report</title>
    <style>
      body{font-family:sans-serif;padding:30px;color:#1e293b;}
      h1{color:rgb(11,74,111);font-size:22px;}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0;}
      .sc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;}
      .sl{font-size:12px;color:#64748b;}.sv{font-size:20px;font-weight:bold;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{background:#f8fafc;padding:10px;font-weight:600;border-bottom:2px solid #cbd5e1;text-align:left;}
      td{padding:10px;border-bottom:1px solid #e2e8f0;}
      @media print{body{padding:0;}}
    </style></head><body>
    <h1>Merchant Shipment Report</h1>
    <div class="stats">
      <div class="sc"><div class="sl">Total</div><div class="sv">${this.summary.total}</div></div>
      <div class="sc"><div class="sl">Delivered</div><div class="sv">${this.summary.delivered}</div></div>
      <div class="sc"><div class="sl">RTO</div><div class="sv">${this.summary.rto}</div></div>
      <div class="sc"><div class="sl">Delivery Rate</div><div class="sv">${this.deliveryRate}</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>AWB</th><th>Status</th><th>Destination</th><th>Carrier</th><th>Weight</th><th>Charge</th></tr></thead>
    <tbody>${rowsHtml}</tbody></table>
    <script>window.onload=function(){window.print();};<\/script>
    </body></html>`);
    win.document.close();
  }
}
