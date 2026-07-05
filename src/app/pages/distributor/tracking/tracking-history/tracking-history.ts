import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../../services/shipment.service';

export interface TrackEvent {
  id: string;
  timestamp: string;
  rawTimestamp: Date;
  action: string;
  status: string;
  rawStatus: string;
  location: string;
  note: string;
}

const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED:    'Order Created',
  PICKED_UP:        'Picked Up',
  ARRIVED_AT_HUB:   'Arrived at Hub',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  DELIVERY_FAILED:  'Delivery Failed',
  RTO:              'RTO',
  CANCELLED:        'Cancelled',
};

@Component({
  selector: 'app-tracking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-history.html',
  styleUrl: './tracking-history.css',
})
export class TrackingHistory implements OnInit {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private shipmentService = inject(ShipmentService);

  awb         = '';
  isLoading   = false;
  error       = '';
  shipment: any = null;

  logs: TrackEvent[]         = [];
  filteredLogs: TrackEvent[] = [];

  // Filters
  dateFilter   = '';
  statusFilter = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const awb = params['awb'] || '';
      if (awb && awb !== this.awb) {
        this.awb = awb;
        this.load();
      } else if (!awb) {
        // No AWB in URL — show the search form only, don't auto-load
        this.awb = '';
      }
    });
  }

  load(): void {
    if (!this.awb.trim()) return;
    this.isLoading = true;
    this.error     = '';
    this.logs      = [];
    this.filteredLogs = [];

    this.shipmentService.trackAWB(this.awb.trim()).subscribe({
      next: (res) => {
        this.shipment = res?.data ?? null;
        if (!this.shipment) {
          this.error     = `Shipment "${this.awb}" not found.`;
          this.isLoading = false;
          return;
        }

        const history: any[] = this.shipment.statusHistory ?? [];
        this.logs = history
          .map((h: any, i: number) => ({
            id:           `EVT-${String(history.length - i).padStart(3, '0')}`,
            rawTimestamp: new Date(h.updatedAt ?? h.timestamp ?? h.createdAt),
            timestamp:    new Date(h.updatedAt ?? h.timestamp ?? h.createdAt)
              .toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            action:    STATUS_LABELS[h.status] ?? h.status,
            status:    STATUS_LABELS[h.status] ?? h.status,
            rawStatus: h.status,
            location:  h.location || this.shipment.destination?.city || '—',
            note:      h.note || h.description || '—',
          }))
          .sort((a, b) => b.rawTimestamp.getTime() - a.rawTimestamp.getTime());

        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error     = err?.error?.message || `Could not fetch tracking data for AWB "${this.awb}".`;
        this.isLoading = false;
      },
    });
  }

  search(): void {
    if (this.awb.trim()) {
      // Update URL so the AWB is bookmarkable
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { awb: this.awb.trim() },
        queryParamsHandling: 'merge',
      });
      this.load();
    }
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const matchDate   = !this.dateFilter   || log.timestamp.includes(this.dateFilter);
      const matchStatus = !this.statusFilter || log.rawStatus === this.statusFilter;
      return matchDate && matchStatus;
    });
  }

  goBack(): void {
    this.router.navigate(['/distributor/tracking/search']);
  }

  downloadPDFLog(): void {
    if (this.filteredLogs.length === 0) {
      alert('No tracking logs to download.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Pop-up blocked. Please allow popups.'); return; }

    const rowsHtml = this.filteredLogs.map(log => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:12px;color:#64748b;">${log.id}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${log.timestamp}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">
          ${log.action}<br>
          <span style="font-size:11px;color:rgb(11,74,111);font-weight:600;text-transform:uppercase;">${log.rawStatus}</span>
        </td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${log.location}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${log.note}</td>
      </tr>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Tracking Log - ${this.awb} - Vexaro</title>
          <style>
            body { font-family:'Segoe UI',sans-serif;color:#1e293b;padding:40px; }
            .logo { font-size:24px;font-weight:800;color:rgb(11,74,111); }
            table { width:100%;border-collapse:collapse;font-size:13px; }
            th { background:#f8fafc;padding:10px;font-weight:600;color:#64748b;border-bottom:2px solid #cbd5e1;text-align:left; }
            .footer { margin-top:40px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px; }
          </style>
        </head>
        <body>
          <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
            <span class="logo">VEXARO</span>
            <span style="font-size:18px;font-weight:bold;color:#64748b;text-transform:uppercase;">Tracking History</span>
          </div>
          <hr style="border:0;border-top:1px solid #e2e8f0;margin-bottom:16px;" />
          <p style="font-size:14px;color:#475569;margin-bottom:24px;">
            <strong>AWB:</strong> ${this.awb} &nbsp;&nbsp;
            <strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <table>
            <thead><tr>
              <th>Event ID</th><th>Timestamp</th><th>Status</th><th>Location</th><th>Note</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="footer">Vexaro Courier Solutions &copy; ${new Date().getFullYear()}</div>
          <script>window.onload=function(){window.print();};<\/script>
        </body>
      </html>`);
    printWindow.document.close();
  }
}
