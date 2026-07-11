import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CsvExportService } from '../../../../shared/csv-export.service';

@Component({
  selector: 'app-shipment-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-reports.html',
  styleUrl: './shipment-reports.css',
})
export class ShipmentReports implements OnInit {
  private http       = inject(HttpClient);
  private csvService = inject(CsvExportService);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = false;
  error     = '';

  summary = { total: 0, delivered: 0, failed: 0, rto: 0, today: 0, pending: 0, inTransit: 0 };

  // Recent shipments used as "daily breakdown" proxy
  recentShipments: any[] = [];

  get deliveryRate(): string {
    if (!this.summary.total) return '—';
    return ((this.summary.delivered / this.summary.total) * 100).toFixed(1) + '%';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const stats$   = this.http.get<any>(`${this.base}/shipments/stats`).pipe(catchError(() => of(null)));
    const recent$  = this.http.get<any>(`${this.base}/shipments`,
      { params: new HttpParams().set('limit', '10').set('page', '1') }
    ).pipe(catchError(() => of(null)));

    forkJoin([stats$, recent$]).subscribe({
      next: ([statsRes, recentRes]) => {
        const s = statsRes?.data ?? statsRes;
        this.summary = {
          total:     s?.total    ?? 0,
          delivered: s?.byStatus?.DELIVERED       ?? 0,
          failed:    s?.byStatus?.DELIVERY_FAILED  ?? 0,
          rto:       s?.byStatus?.RTO              ?? 0,
          today:     s?.today ?? 0,
          pending:   s?.byStatus?.ORDER_CREATED    ?? 0,
          inTransit: (s?.byStatus?.PICKED_UP ?? 0) +
                     (s?.byStatus?.ARRIVED_AT_HUB ?? 0) +
                     (s?.byStatus?.OUT_FOR_DELIVERY ?? 0),
        };

        this.recentShipments = (recentRes?.data?.shipments ?? []).map((sh: any) => ({
          awb:     sh.awb,
          date:    new Date(sh.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status:  sh.status,
          dest:    sh.destination?.city ?? '—',
          carrier: sh.carrier ?? '—',
          weight:  sh.weight ?? 0,
          isCOD:   sh.isCOD ?? false,
          cod:     sh.codAmount ?? 0,
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load shipment report.';
        this.isLoading = false;
      },
    });
  }

  exportCSV(): void {
    const headers = ['AWB', 'Date', 'Status', 'Destination', 'Carrier', 'Weight (kg)', 'Payment', 'COD Amount'];
    const rows = this.recentShipments.map(s => [
      s.awb, s.date, s.status, s.dest, s.carrier, s.weight,
      s.isCOD ? 'COD' : 'Prepaid', s.cod,
    ]);
    this.csvService.export('distributor_shipment_report', headers, rows);
  }

  exportPDF(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Pop-up blocked. Please allow popups.'); return; }

    const rowsHtml = this.recentShipments.map(s => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:12px;">${s.awb}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.date}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.status}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.dest}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.carrier}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.weight} kg</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${s.isCOD ? 'COD ₹' + s.cod : 'Prepaid'}</td>
      </tr>`).join('');

    printWindow.document.write(`<html><head><title>Shipment Report - Vexaro</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;color:#1e293b;padding:40px;}
        .logo{font-size:24px;font-weight:800;color:rgb(11,74,111);}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0;}
        .sc{background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;}
        .sl{font-size:12px;color:#64748b;margin-bottom:4px;}
        .sv{font-size:20px;font-weight:bold;color:#0f172a;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        th{background:#f8fafc;padding:10px;font-weight:600;color:#64748b;border-bottom:2px solid #cbd5e1;text-align:left;}
        .footer{margin-top:40px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <span class="logo">VEXARO</span>
        <span style="font-size:18px;font-weight:bold;color:#64748b;">Shipment Report</span>
      </div>
      <hr style="border:0;border-top:1px solid #e2e8f0;margin-bottom:16px;" />
      <div class="stats">
        <div class="sc"><span class="sl">Total</span><span class="sv">${this.summary.total}</span></div>
        <div class="sc"><span class="sl">Delivered</span><span class="sv" style="color:#16a34a;">${this.summary.delivered}</span></div>
        <div class="sc"><span class="sl">RTO</span><span class="sv" style="color:#ea580c;">${this.summary.rto}</span></div>
        <div class="sc"><span class="sl">Delivery Rate</span><span class="sv">${this.deliveryRate}</span></div>
      </div>
      <h3 style="margin-bottom:12px;color:#0f172a;">Recent Shipments (Latest 10)</h3>
      <table><thead><tr>
        <th>AWB</th><th>Date</th><th>Status</th><th>Destination</th><th>Carrier</th><th>Weight</th><th>Payment</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      <div class="footer">Vexaro Courier Solutions &copy; ${new Date().getFullYear()}</div>
      <script>window.onload=function(){window.print();};<\/script>
    </body></html>`);
    printWindow.document.close();
  }
}
