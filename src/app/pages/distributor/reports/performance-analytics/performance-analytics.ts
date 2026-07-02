import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvExportService } from '../../../../shared/csv-export.service';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-analytics.html',
  styleUrl: './performance-analytics.css'
})
export class PerformanceAnalytics implements OnInit {
  dateRange: string = 'This Month';
  merchantFilter: string = 'All Merchants';
  isLoading: boolean = false;

  summary = {
    revenue: 0,
    profitMargin: '0%',
    activeMerchants: 0,
    merchantGrowth: '+0%'
  };

  dataList: any[] = [];

  private csvService = inject(CsvExportService);

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/reports/performance
    this.summary = {
      revenue: 545000,
      profitMargin: '9%',
      activeMerchants: 10,
      merchantGrowth: '+12%'
    };
    this.dataList = [
      { name: 'Average Pickup Time', value: '2.4 Hours', rating: 'Excellent', ratingClass: 'text-success' },
      { name: 'Average Delivery Time', value: '2.8 Days', rating: 'Good', ratingClass: 'text-primary' },
      { name: 'RTO Rate', value: '4.2%', rating: 'Very Low', ratingClass: 'text-success' },
      { name: 'Customer Satisfaction', value: '4.8 / 5', rating: 'Excellent', ratingClass: 'text-success' },
      { name: 'Dispute Resolution Rate', value: '96%', rating: 'Excellent', ratingClass: 'text-success' },
    ];
    this.isLoading = false;
  }

  exportCSV() {
    const headers = ['Performance Metric', 'Value', 'Rating'];
    const rows = this.dataList.map(item => [
      item.name,
      item.value,
      item.rating
    ]);
    this.csvService.export('distributor_performance_analytics', headers, rows);
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
          <td>${item.name}</td>
          <td>${item.value}</td>
          <td style="text-align: right;">${item.rating}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Performance Analytics Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; }
            h1 { color: #0b4a6f; text-align: center; border-bottom: 2px solid #0b4a6f; padding-bottom: 10px; }
            .header-info { margin-bottom: 20px; display: flex; justify-content: space-between; }
            .summary-section { margin-bottom: 30px; display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .summary-box { text-align: center; }
            .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .summary-val { font-size: 20px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 600; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Performance Analytics Report</h1>
          <div class="header-info">
            <div><strong>Date Range:</strong> ${this.dateRange}</div>
            <div><strong>Merchant Filter:</strong> ${this.merchantFilter}</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-val">₹${this.summary.revenue.toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Profit Margin</div>
              <div class="summary-val">${this.summary.profitMargin}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Active Merchants</div>
              <div class="summary-val">${this.summary.activeMerchants}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Merchant Growth</div>
              <div class="summary-val">${this.summary.merchantGrowth}</div>
            </div>
          </div>

          <h2>Key Performance Metrics</h2>
          <table>
            <thead>
              <tr>
                <th>Performance Metric</th>
                <th>Value</th>
                <th style="text-align: right;">Rating</th>
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
