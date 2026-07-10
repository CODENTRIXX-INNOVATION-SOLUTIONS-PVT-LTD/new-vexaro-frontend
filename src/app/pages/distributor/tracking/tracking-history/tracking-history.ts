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
  source: string;
}

const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Order Created',
  PICKED_UP: 'Picked Up',
  ARRIVED_AT_HUB: 'Arrived at Hub',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed',
  RTO: 'RTO',
  CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-tracking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-history.html',
  styleUrl: './tracking-history.css',
})
export class TrackingHistory implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shipmentService = inject(ShipmentService);

  awb = '';
  isLoading = false;
  error = '';
  shipment: any = null;

  logs: TrackEvent[] = [];
  filteredLogs: TrackEvent[] = [];

  dateFilter = '';
  statusFilter = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const awb = params['awb'] || '';
      if (awb && awb !== this.awb) {
        this.awb = awb;
        this.load();
      } else if (!awb) {
        this.awb = '';
      }
    });
  }

  load(): void {
    if (!this.awb.trim()) return;
    this.isLoading = true;
    this.error = '';
    this.logs = [];
    this.filteredLogs = [];

    this.shipmentService.trackAWB(this.awb.trim()).subscribe({
      next: (res) => {
        this.shipment = res?.data ?? null;
        if (!this.shipment) {
          this.error = `Shipment "${this.awb}" not found.`;
          this.isLoading = false;
          return;
        }

        this.logs = this.buildLogs(this.shipment);
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err?.error?.message || `Could not fetch tracking data for AWB "${this.awb}".`;
        this.isLoading = false;
      },
    });
  }

  search(): void {
    if (this.awb.trim()) {
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
      const matchDate = !this.dateFilter || log.timestamp.includes(this.dateFilter);
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
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups.');
      return;
    }

    const rowsHtml = this.filteredLogs.map(log => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:12px;color:#64748b;">${this.escapeHtml(log.id)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${this.escapeHtml(log.timestamp)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">
          ${this.escapeHtml(log.action)}<br>
          <span style="font-size:11px;color:rgb(11,74,111);font-weight:600;text-transform:uppercase;">${this.escapeHtml(log.rawStatus)}</span>
        </td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${this.escapeHtml(log.location)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">
          ${this.escapeHtml(log.note)}<br>
          <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;">${this.escapeHtml(log.source)}</span>
        </td>
      </tr>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Tracking Log - ${this.escapeHtml(this.awb)} - Vexaro</title>
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
            <strong>AWB:</strong> ${this.escapeHtml(this.awb)} &nbsp;&nbsp;
            <strong>Generated:</strong> ${new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

  private buildLogs(data: any): TrackEvent[] {
    const localHistory: any[] = Array.isArray(data.statusHistory)
      ? data.statusHistory
      : (Array.isArray(data.history) ? data.history : []);
    const velocityHistory = this.extractVelocityEvents(data.velocityTracking);
    const merged = [
      ...velocityHistory.map((event: any) => ({
        rawDate: this.eventTime(event),
        rawStatus: event.status || event.current_status || event.activity || event.remark || 'TRACKING_UPDATE',
        location: event.location || event.city || event.scan_location || event.scanLocation || data.destination?.city || '-',
        note: event.remark || event.activity || event.description || event.status || '-',
        source: 'Velocity',
      })),
      ...localHistory.map((event: any) => ({
        rawDate: event.updatedAt || event.timestamp || event.createdAt,
        rawStatus: event.status || 'TRACKING_UPDATE',
        location: event.location || data.destination?.city || '-',
        note: event.note || event.description || '-',
        source: 'Vexaro',
      })),
    ].sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());

    return merged.map((event: any, index: number) => ({
      id: `EVT-${String(index + 1).padStart(3, '0')}`,
      rawTimestamp: new Date(event.rawDate),
      timestamp: this.formatDateTime(event.rawDate),
      action: STATUS_LABELS[event.rawStatus] ?? this.formatStatus(event.rawStatus),
      status: STATUS_LABELS[event.rawStatus] ?? this.formatStatus(event.rawStatus),
      rawStatus: event.rawStatus,
      location: event.location,
      note: event.note,
      source: event.source,
    }));
  }

  private formatDateTime(value: any): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private formatStatus(status: string): string {
    return String(status || 'Tracking Update')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private eventTime(event: any): string {
    return event?.date
      || event?.timestamp
      || event?.time
      || event?.event_timestamp
      || event?.event_date_time
      || event?.scan_date_time
      || event?.created_at
      || '';
  }

  private extractVelocityEvents(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.tracking_data
      || raw.shipment_track_activities
      || raw.shipment_track
      || raw.track_activities
      || raw.activities
      || raw.events
      || raw.scans
      || [];
  }

  private escapeHtml(value: any): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
