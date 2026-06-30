import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvExportService } from '../../../../shared/csv-export.service';

@Component({
  selector: 'app-shipment-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-reports.html',
  styleUrl: './shipment-reports.css'
})
export class ShipmentReports implements OnInit {
  dateRange: string = 'This Month';
  merchantFilter: string = 'All Merchants';
  isLoading: boolean = false;

  summary = {
    total: 0,
    delivered: 0,
    failed: 0,
    rto: 0
  };

  dataList: any[] = [];

  private csvService = inject(CsvExportService);

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/reports/shipments
    this.summary = {
      total: 890,
      delivered: 812,
      failed: 43,
      rto: 35
    };
    this.dataList = [
      { date: '17 Jun 2026', total: 48, delivered: 42, failed: 4, rto: 2, codCollected: 45000 },
      { date: '16 Jun 2026', total: 55, delivered: 50, failed: 3, rto: 2, codCollected: 38000 },
      { date: '15 Jun 2026', total: 60, delivered: 55, failed: 3, rto: 2, codCollected: 52000 },
      { date: '14 Jun 2026', total: 42, delivered: 38, failed: 2, rto: 2, codCollected: 29000 },
      { date: '13 Jun 2026', total: 38, delivered: 35, failed: 2, rto: 1, codCollected: 18000 },
    ];
    this.isLoading = false;
  }

  exportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to download report.');
      return;
    }

    const rowsHtml = this.dataList.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.date}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">${item.total}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">${item.delivered}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #dc2626;">${item.failed}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #ea580c;">${item.rto}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">₹${item.codCollected.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipment Performance Report - Vexaro</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header-table { width: 100%; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: rgb(11, 74, 111); }
            .title { text-align: right; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0 35px; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
            .stat-label { font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 500; }
            .stat-value { font-size: 20px; font-weight: bold; color: #0f172a; }

            .trx-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
            .trx-table th { background: #f8fafc; padding: 10px; font-weight: 600; color: #64748b; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo">VEXARO</td>
              <td class="title">Shipment Report</td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <div style="font-size: 13px; color: #475569; display: flex; justify-content: space-between;">
            <div><strong>Date Range:</strong> ${this.dateRange}</div>
            <div><strong>Filter:</strong> ${this.merchantFilter}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Volume</span>
              <span class="stat-value">${this.summary.total}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Delivered</span>
              <span class="stat-value" style="color: #16a34a;">${this.summary.delivered}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Failed</span>
              <span class="stat-value" style="color: #dc2626;">${this.summary.failed}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">RTO</span>
              <span class="stat-value" style="color: #ea580c;">${this.summary.rto}</span>
            </div>
          </div>

          <table class="trx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Shipments</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>RTO</th>
                <th>COD Collected</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated performance report ledger statement.</p>
            <p>Vexaro Courier Solutions &copy; ${new Date().getFullYear()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
    `);
    printWindow.document.close();
  }

  exportCSV() {
    const headers = ['Date', 'Total Shipments', 'Delivered', 'Failed', 'RTO', 'COD Collected (INR)'];
    const rows = this.dataList.map(item => [
      item.date,
      item.total,
      item.delivered,
      item.failed,
      item.rto,
      item.codCollected
    ]);
    this.csvService.export('distributor_shipment_report', headers, rows);
  }
}
