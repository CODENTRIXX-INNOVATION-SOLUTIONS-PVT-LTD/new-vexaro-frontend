import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvExportService } from '../../../shared/csv-export.service';

@Component({
  selector: 'app-merchant-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  dateRange: string = 'This Month';
  statusFilter: string = 'All Statuses';
  carrierFilter: string = 'All Carriers';
  isLoading: boolean = false;

  summary = {
    total: 0,
    delivered: 0,
    failed: 0,
    rto: 0,
    weightDisputes: 0,
    codPerformance: 0,
    walletSpend: 0
  };

  dataList: any[] = [];

  private csvService = inject(CsvExportService);

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    
    // Mocking an API call
    setTimeout(() => {
      this.summary = {
        total: 1250,
        delivered: 1100,
        failed: 100,
        rto: 50,
        weightDisputes: 25,
        codPerformance: 98.5,
        walletSpend: 15400
      };

      this.dataList = [
        { date: '16 Jun 2026', total: 45, delivered: 40, failed: 3, rto: 2 },
        { date: '15 Jun 2026', total: 60, delivered: 55, failed: 4, rto: 1 },
        { date: '14 Jun 2026', total: 50, delivered: 45, failed: 2, rto: 3 },
        { date: '13 Jun 2026', total: 70, delivered: 65, failed: 5, rto: 0 },
        { date: '12 Jun 2026', total: 40, delivered: 35, failed: 2, rto: 3 }
      ];

      this.isLoading = false;
    }, 600);
  }

  exportCSV() {
    const headers = ['Date', 'Total Shipments', 'Delivered', 'Failed', 'RTO'];
    const rows = this.dataList.map(item => [
      item.date,
      item.total,
      item.delivered,
      item.failed,
      item.rto
    ]);
    this.csvService.export('merchant_shipment_report', headers, rows);
  }

  exportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF report.');
      return;
    }
    
    let rowsHtml = '';
    this.dataList.forEach(item => {
      rowsHtml += `
        <tr>
          <td>${item.date}</td>
          <td style="text-align: right;">${item.total}</td>
          <td style="text-align: right;">${item.delivered}</td>
          <td style="text-align: right;">${item.failed}</td>
          <td style="text-align: right;">${item.rto}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Merchant Shipment Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; }
            h1 { color: #0b4a6f; text-align: center; border-bottom: 2px solid #0b4a6f; padding-bottom: 10px; }
            .header-info { margin-bottom: 20px; display: flex; justify-content: space-between; }
            .summary-section { margin-bottom: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
            .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .summary-val { font-size: 20px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 13px; text-transform: uppercase; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Shipment Performance Report</h1>
          <div class="header-info">
            <div><strong>Date Range:</strong> ${this.dateRange}</div>
            <div><strong>Filters:</strong> ${this.statusFilter}, ${this.carrierFilter}</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-label">Total Shipments</div>
              <div class="summary-val">${this.summary.total}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Delivered</div>
              <div class="summary-val" style="color: #16a34a;">${this.summary.delivered}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Failed / RTO</div>
              <div class="summary-val" style="color: #ef4444;">${this.summary.failed + this.summary.rto}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">COD Performance</div>
              <div class="summary-val" style="color: #16a34a;">${this.summary.codPerformance}%</div>
            </div>
          </div>

          <h2>Daily Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th style="text-align: right;">Total</th>
                <th style="text-align: right;">Delivered</th>
                <th style="text-align: right;">Failed</th>
                <th style="text-align: right;">RTO</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Generated by Vexaro System
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
