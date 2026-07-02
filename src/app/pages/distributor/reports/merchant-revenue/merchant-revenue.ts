import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvExportService } from '../../../../shared/csv-export.service';

export interface MerchantRevenue {
  id: string;
  name: string;
  shipments: number;
  revenue: number;
  codRemitted: number;
  codPending: number;
  franchiseShare: number;
}

@Component({
  selector: 'app-merchant-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon title-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> 
          Merchant Revenue Report
        </h1>
        <div class="actions">
          <button class="action-btn outline" (click)="exportPDF()">Export PDF</button>
          <button class="action-btn" (click)="exportCSV()">Export CSV</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Volume</div>
          <div class="stat-value">{{totalShipments}}</div>
          <div class="stat-sub">Delivered shipments</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">₹{{totalRevenue | number}}</div>
          <div class="stat-sub">Gross courier charges</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Franchise Profit</div>
          <div class="stat-value text-success">₹{{totalProfit | number}}</div>
          <div class="stat-sub">Net earnings share</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-header">
          <h2 class="section-title">Revenue by Merchant</h2>
          <input type="text" placeholder="Search merchant..." [(ngModel)]="searchTerm" (input)="applyFilters()" class="search-input">
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th class="text-right">Shipments</th>
              <th class="text-right">Revenue</th>
              <th class="text-right">COD Remitted</th>
              <th class="text-right">COD Pending</th>
              <th class="text-right">Franchise Share</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredData.length === 0) {
              <tr>
                <td colspan="6" class="text-center py-4" style="color: #94a3b8;">No records found.</td>
              </tr>
            } @else {
              @for (row of filteredData; track row.id) {
                <tr>
                  <td>
                    <div class="fw-bold">{{row.name}}</div>
                    <div style="font-size: 12px; color: #64748b;">{{row.id}}</div>
                  </td>
                  <td class="text-right">{{row.shipments}}</td>
                  <td class="text-right fw-bold">₹{{row.revenue | number}}</td>
                  <td class="text-right text-success">₹{{row.codRemitted | number}}</td>
                  <td class="text-right text-warning">₹{{row.codPending | number}}</td>
                  <td class="text-right fw-bold text-success">₹{{row.franchiseShare | number}}</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; background: #f8fafc; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px; }
    .svg-icon { width: 1.2em; height: 1.2em; }
    .title-icon { color: rgb(11, 74, 111); }
    .actions { display: flex; gap: 8px; }
    .action-btn { background: rgb(11, 74, 111); color: #fff; border: none; padding: 9px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; transition: background 0.2s; }
    .action-btn.outline { background: #fff; border: 1px solid #cbd5e1; color: #334155; }
    .action-btn:hover { background: rgb(8, 55, 83); }
    .action-btn.outline:hover { background: #f1f5f9; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .stat-label { font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
    .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; }
    .stat-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .text-success { color: #16a34a !important; }
    
    .table-container { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
    .search-input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; min-width: 240px; }
    
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right !important; }
    .text-warning { color: #d97706 !important; }
    .fw-bold { font-weight: 600; color: #0f172a; }
    .text-center { text-align: center; }
    .py-4 { padding: 32px 0; }
  `]
})
export class MerchantRevenueReport implements OnInit {
  searchTerm: string = '';
  data: MerchantRevenue[] = [
    { id: 'MER001', name: 'ABC Electronics', shipments: 380, revenue: 190000, codRemitted: 110000, codPending: 80000, franchiseShare: 18000 },
    { id: 'MER002', name: 'Global Traders', shipments: 450, revenue: 320000, codRemitted: 270000, codPending: 50000, franchiseShare: 25000 },
    { id: 'MER003', name: 'Prime Retail', shipments: 60, revenue: 35000, codRemitted: 35000, codPending: 0, franchiseShare: 2000 }
  ];
  filteredData: MerchantRevenue[] = [];

  private csvService = inject(CsvExportService);

  get totalRevenue(): number { return this.data.reduce((s, d) => s + d.revenue, 0); }
  get totalShipments(): number { return this.data.reduce((s, d) => s + d.shipments, 0); }
  get totalProfit(): number { return this.data.reduce((s, d) => s + d.franchiseShare, 0); }

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredData = this.data.filter(d => 
      d.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  exportCSV() {
    const headers = ['Merchant ID', 'Merchant Name', 'Shipments', 'Revenue (INR)', 'COD Remitted (INR)', 'COD Pending (INR)', 'Franchise Share (INR)'];
    const rows = this.filteredData.map(row => [
      row.id,
      row.name,
      row.shipments,
      row.revenue,
      row.codRemitted,
      row.codPending,
      row.franchiseShare
    ]);
    this.csvService.export('merchant_revenue_report', headers, rows);
  }

  exportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF report.');
      return;
    }
    
    let rowsHtml = '';
    this.filteredData.forEach(row => {
      rowsHtml += `
        <tr>
          <td>
            <div style="font-weight: 600;">${row.name}</div>
            <div style="font-size: 12px; color: #64748b;">${row.id}</div>
          </td>
          <td style="text-align: right;">${row.shipments}</td>
          <td style="text-align: right; font-weight: 600;">₹${row.revenue.toLocaleString()}</td>
          <td style="text-align: right; color: #16a34a;">₹${row.codRemitted.toLocaleString()}</td>
          <td style="text-align: right; color: #d97706;">₹${row.codPending.toLocaleString()}</td>
          <td style="text-align: right; font-weight: 600; color: #16a34a;">₹${row.franchiseShare.toLocaleString()}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Merchant Revenue Report</title>
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
            th { background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 13px; text-transform: uppercase; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Merchant Revenue Report</h1>
          <div class="header-info">
            <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
            <div><strong>Total Merchants:</strong> ${this.filteredData.length}</div>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-label">Total Volume</div>
              <div class="summary-val">${this.totalShipments.toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-val">₹${this.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Franchise Profit</div>
              <div class="summary-val" style="color: #16a34a;">₹${this.totalProfit.toLocaleString()}</div>
            </div>
          </div>

          <h2>Revenue Details by Merchant</h2>
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th style="text-align: right;">Shipments</th>
                <th style="text-align: right;">Revenue</th>
                <th style="text-align: right;">COD Remitted</th>
                <th style="text-align: right;">COD Pending</th>
                <th style="text-align: right;">Franchise Share</th>
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
