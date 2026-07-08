import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CsvExportService } from '../../../shared/csv-export.service';

@Component({
  selector: 'app-merchant-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  private http = inject(HttpClient);
  private csvService = inject(CsvExportService);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = false;
  error = '';

  page = 1;
  readonly limit = 20;
  total = 0;
  totalPages = 1;
  hasNextPage = false;
  hasPrevPage = false;

  dateRange = 'This Month';
  statusFilter = 'All Statuses';
  carrierFilter = 'All Carriers';

  summary = {
    total: 0,
    delivered: 0,
    failed: 0,
    rto: 0,
    inTransit: 0,
    pending: 0,
    totalCost: 0,
    weightDisputes: 0,
  };

  dataList: any[] = [];

  get deliveryRate(): string {
    if (!this.summary.total) return '-';
    return ((this.summary.delivered / this.summary.total) * 100).toFixed(1) + '%';
  }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(resetPage = true): void {
    if (resetPage) this.page = 1;
    this.isLoading = true;
    this.error = '';

    let shipmentParams = new HttpParams()
      .set('limit', this.limit.toString())
      .set('page', this.page.toString());
    let statsParams = new HttpParams();

    const status = this.statusToApiValue(this.statusFilter);
    if (status) {
      shipmentParams = shipmentParams.set('status', status);
      statsParams = statsParams.set('status', status);
    }

    const dateParams = this.getDateRangeParams();
    if (dateParams.dateFrom) {
      shipmentParams = shipmentParams.set('dateFrom', dateParams.dateFrom);
      statsParams = statsParams.set('dateFrom', dateParams.dateFrom);
    }
    if (dateParams.dateTo) {
      shipmentParams = shipmentParams.set('dateTo', dateParams.dateTo);
      statsParams = statsParams.set('dateTo', dateParams.dateTo);
    }

    if (this.carrierFilter !== 'All Carriers') {
      shipmentParams = shipmentParams.set('carrier', this.carrierFilter);
      statsParams = statsParams.set('carrier', this.carrierFilter);
    }

    const stats$ = this.http.get<any>(`${this.base}/shipments/stats`, { params: statsParams });
    const shipments$ = this.http.get<any>(`${this.base}/shipments`, { params: shipmentParams });
    const disputes$ = this.http.get<any>(`${this.base}/disputes`, {
      params: new HttpParams().set('limit', '1'),
    });

    forkJoin([stats$, shipments$, disputes$]).subscribe({
      next: ([statsRes, shipmentRes, disputesRes]) => {
        const stats = statsRes?.data ?? statsRes;
        const by = stats?.byStatus ?? {};

        this.summary = {
          total: stats?.total ?? 0,
          delivered: by.DELIVERED ?? 0,
          failed: by.DELIVERY_FAILED ?? 0,
          rto: by.RTO ?? 0,
          inTransit: (by.PICKED_UP ?? 0) + (by.ARRIVED_AT_HUB ?? 0) + (by.OUT_FOR_DELIVERY ?? 0) + (by.IN_TRANSIT ?? 0),
          pending: by.ORDER_CREATED ?? 0,
          totalCost: stats?.totalCost ?? 0,
          weightDisputes: disputesRes?.meta?.total ?? 0,
        };

        const meta = shipmentRes?.meta ?? {};
        this.total = meta.total ?? 0;
        this.totalPages = meta.pages ?? 1;
        this.hasNextPage = Boolean(meta.hasNextPage);
        this.hasPrevPage = Boolean(meta.hasPrevPage);

        this.dataList = (shipmentRes?.data?.shipments ?? []).map((shipment: any) => ({
          date: shipment.createdAt
            ? new Date(shipment.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-',
          awb: shipment.carrierAWB || shipment.awb || '-',
          vexaroAwb: shipment.awb || '-',
          status: shipment.status || '-',
          dest: [shipment.destination?.city, shipment.destination?.state].filter(Boolean).join(', ') || '-',
          carrier: shipment.carrier || '-',
          weight: shipment.billingWeight || shipment.weight || 0,
          total: shipment.merchantCost || 0,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load report.';
        this.isLoading = false;
      },
    });
  }

  private statusToApiValue(label: string): string {
    switch (label) {
      case 'Delivered': return 'DELIVERED';
      case 'Failed': return 'DELIVERY_FAILED';
      case 'RTO': return 'RTO';
      case 'Order Created': return 'ORDER_CREATED';
      case 'In Transit': return 'IN_TRANSIT';
      default: return '';
    }
  }

  private getDateRangeParams(): { dateFrom?: string; dateTo?: string } {
    const now = new Date();
    const start = new Date(now);

    if (this.dateRange === 'Today') {
      start.setHours(0, 0, 0, 0);
      return { dateFrom: start.toISOString(), dateTo: now.toISOString() };
    }

    if (this.dateRange === 'This Week') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { dateFrom: start.toISOString(), dateTo: now.toISOString() };
    }

    if (this.dateRange === 'Last Month') {
      const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { dateFrom: firstLastMonth.toISOString(), dateTo: firstThisMonth.toISOString() };
    }

    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { dateFrom: start.toISOString(), dateTo: now.toISOString() };
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages || nextPage === this.page) return;
    this.page = nextPage;
    this.loadReport(false);
  }

  getStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED': return 'status delivered';
      case 'RTO':
      case 'CANCELLED':
      case 'DELIVERY_FAILED': return 'status failed';
      case 'OUT_FOR_DELIVERY':
      case 'ARRIVED_AT_HUB':
      case 'PICKED_UP':
      case 'IN_TRANSIT': return 'status transit';
      default: return 'status pending';
    }
  }

  exportCSV(): void {
    const headers = ['Date', 'Carrier AWB', 'Vexaro AWB', 'Status', 'Destination', 'Carrier', 'Weight (kg)', 'Charge (INR)'];
    const rows = this.dataList.map((shipment) => [
      shipment.date,
      shipment.awb,
      shipment.vexaroAwb,
      shipment.status,
      shipment.dest,
      shipment.carrier,
      shipment.weight,
      shipment.total,
    ]);
    this.csvService.export('merchant_shipment_report', headers, rows);
  }

  exportPDF(): void {
    const win = window.open('', '_blank');
    if (!win) return;

    const rowsHtml = this.dataList.map((shipment) => `
      <tr>
        <td>${this.escapeHtml(shipment.date)}</td>
        <td>${this.escapeHtml(shipment.awb)}</td>
        <td>${this.escapeHtml(shipment.status)}</td>
        <td>${this.escapeHtml(shipment.dest)}</td>
        <td>${this.escapeHtml(shipment.carrier)}</td>
        <td style="text-align:right;">${this.escapeHtml(shipment.weight)} kg</td>
        <td style="text-align:right;">INR ${Number(shipment.total ?? 0).toFixed(2)}</td>
      </tr>`).join('');

    win.document.write(`<html><head><title>Merchant Report</title>
    <style>
      body{font-family:sans-serif;padding:30px;color:#1e293b;}
      h1{color:rgb(11,74,111);font-size:22px;}
      .meta{color:#64748b;font-size:12px;margin-bottom:16px;}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0;}
      .sc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;}
      .sl{font-size:12px;color:#64748b;}.sv{font-size:20px;font-weight:bold;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{background:#f8fafc;padding:10px;font-weight:600;border-bottom:2px solid #cbd5e1;text-align:left;}
      td{padding:10px;border-bottom:1px solid #e2e8f0;}
      @media print{body{padding:0;}}
    </style></head><body>
    <h1>Merchant Shipment Report</h1>
    <div class="meta">${this.escapeHtml(this.dateRange)} | ${this.escapeHtml(this.statusFilter)} | ${this.escapeHtml(this.carrierFilter)} | Page ${this.page} of ${this.totalPages}</div>
    <div class="stats">
      <div class="sc"><div class="sl">Total</div><div class="sv">${this.summary.total}</div></div>
      <div class="sc"><div class="sl">Delivered</div><div class="sv">${this.summary.delivered}</div></div>
      <div class="sc"><div class="sl">RTO</div><div class="sv">${this.summary.rto}</div></div>
      <div class="sc"><div class="sl">Delivery Rate</div><div class="sv">${this.deliveryRate}</div></div>
    </div>
    <table><thead><tr><th>Date</th><th>Carrier AWB</th><th>Status</th><th>Destination</th><th>Carrier</th><th>Weight</th><th>Charge</th></tr></thead>
    <tbody>${rowsHtml || '<tr><td colspan="7">No shipments found.</td></tr>'}</tbody></table>
    <script>window.onload=function(){window.print();};<\/script>
    </body></html>`);
    win.document.close();
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
