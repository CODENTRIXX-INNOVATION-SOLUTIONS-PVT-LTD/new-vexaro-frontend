import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  coordinates: string;
  deviceInfo: string;
  status: string;
}

@Component({
  selector: 'app-tracking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-history.html',
  styleUrl: './tracking-history.css'
})
export class TrackingHistory implements OnInit {
  awb: string = '';
  logs: AuditEvent[] = [];
  filteredLogs: AuditEvent[] = [];

  dateFilter: string = '';
  statusFilter: string = 'All';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.awb = params['awb'] || 'VEX-DEMO';
      this.loadDummyData();
      this.applyFilters();
    });
  }

  loadDummyData() {
    this.logs = [
      { id: 'LOG-005', timestamp: '2026-06-16 08:30:12', action: 'Status Update: OUT_FOR_DELIVERY', actor: 'System (Auto)', coordinates: '19.0760° N, 72.8777° E', deviceInfo: 'Server', status: 'Out for Delivery' },
      { id: 'LOG-004', timestamp: '2026-06-16 06:05:00', action: 'Assigned to Route 4', actor: 'Dispatcher Rahul', coordinates: 'Hub Coordinates', deviceInfo: 'Web Panel IP: 10.0.x.x', status: 'Sorted' },
      { id: 'LOG-003', timestamp: '2026-06-15 21:45:33', action: 'Bag Unsealed & Scanned In', actor: 'Scanner ID 402', coordinates: 'Hub Coordinates', deviceInfo: 'Zebra MC9300', status: 'Received at Hub' },
      { id: 'LOG-002', timestamp: '2026-06-15 16:15:10', action: 'Pickup Complete', actor: 'Driver Amit', coordinates: '19.1136° N, 72.8697° E', deviceInfo: 'Android App v2.1', status: 'Picked Up' },
      { id: 'LOG-001', timestamp: '2026-06-15 10:00:05', action: 'AWB Generated', actor: 'Merchant API', coordinates: 'N/A', deviceInfo: 'API v1', status: 'Manifested' },
    ];
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      const matchesDate = !this.dateFilter || log.timestamp.includes(this.dateFilter);
      const matchesStatus = this.statusFilter === 'All' || log.status === this.statusFilter;
      return matchesDate && matchesStatus;
    });
  }

  goBack() {
    this.router.navigate(['/distributor/tracking/search']);
  }

  downloadPDFLog() {
    if (this.filteredLogs.length === 0) {
      alert('No tracking logs to download.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to view statement.');
      return;
    }

    const rowsHtml = this.filteredLogs.map(log => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px; color: #64748b;">${log.id}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${log.timestamp}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          ${log.action}<br>
          <span style="font-size: 11px; color: rgb(11, 74, 111); font-weight: 600; text-transform: uppercase;">${log.status}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${log.actor}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${log.coordinates}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; font-size: 12px;">${log.deviceInfo}</code></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Audit Logs - ${this.awb} - Vexaro</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header-table { width: 100%; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: rgb(11, 74, 111); }
            .title { text-align: right; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .meta-section { margin-bottom: 30px; font-size: 14px; color: #475569; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .meta-table td { padding: 6px 0; }
            .trx-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
            .trx-table th { background: #f8fafc; padding: 12px 10px; font-weight: 600; color: #64748b; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo">VEXARO</td>
              <td class="title">Immutable Audit Ledger</td>
            </tr>
          </table>

          <div class="meta-section">
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
            <table class="meta-table">
              <tr>
                <td><strong>AWB Number:</strong> ${this.awb}</td>
                <td style="text-align: right;"><strong>Statement Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <table class="trx-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Coordinates</th>
                <th>Device / IP</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated audit log sheet and does not require a physical signature.</p>
            <p>Vexaro Courier Solutions &copy; ${new Date().getFullYear()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
