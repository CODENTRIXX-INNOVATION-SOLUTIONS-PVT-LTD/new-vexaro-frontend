import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../../services/reports.service';

export interface CourierProfit {
  name: string;
  shipments: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
}

export interface MerchantProfit {
  name: string;
  shipments: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: string;
}

@Component({
  selector: 'app-profit-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon title-icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v10h10"></path></svg> 
          Profit Report
        </h1>
        <div class="actions">
          <button class="action-btn" (click)="exportPDF()">Download PDF Report</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Net Profit</span>
          <span class="stat-value">₹{{netProfit.toLocaleString('en-IN')}}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Average Profit / Order</span>
          <span class="stat-value">₹{{avgProfit.toFixed(2)}}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Net Profit Margin</span>
          <span class="stat-value">{{profitMargin.toFixed(2)}}%</span>
        </div>
      </div>

      <div class="section-title">Profits by Courier Partner</div>
      <div class="table-wrapper mb-4">
        <table>
          <thead>
            <tr>
              <th>Courier Name</th>
              <th>Total Shipments</th>
              <th>Total Revenue</th>
              <th>Franchise Cost</th>
              <th>Net Profit</th>
              <th>Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of courierData">
              <td class="fw-bold">{{item.name}}</td>
              <td>{{item.shipments}}</td>
              <td>₹{{item.revenue.toLocaleString('en-IN')}}</td>
              <td>₹{{item.cost.toLocaleString('en-IN')}}</td>
              <td>₹{{item.profit.toLocaleString('en-IN')}}</td>
              <td><span class="badge profit">{{item.margin}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section-title">Profits by Merchant Customer</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Merchant Name</th>
              <th>Total Shipments</th>
              <th>Total Revenue</th>
              <th>Franchise Cost</th>
              <th>Net Profit</th>
              <th>Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of merchantData">
              <td class="fw-bold">{{item.name}}</td>
              <td>{{item.shipments}}</td>
              <td>₹{{item.revenue.toLocaleString('en-IN')}}</td>
              <td>₹{{item.cost.toLocaleString('en-IN')}}</td>
              <td>₹{{item.profit.toLocaleString('en-IN')}}</td>
              <td><span class="badge profit">{{item.margin}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; font-family: 'Inter', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 700; color: #0f172a; display: flex; align-items: center; }
    .title-icon { color: rgb(11, 74, 111); margin-right: 10px; width: 24px; height: 24px; }
    .action-btn { background: rgb(11, 74, 111); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .action-btn:hover { background: rgb(8, 58, 87); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
    .stat-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .section-title { font-size: 16px; font-weight: 600; color: #334155; margin-bottom: 16px; }
    .table-wrapper { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .mb-4 { margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .fw-bold { font-weight: 600; color: #0f172a; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .badge.profit { background: #dcfce7; color: #15803d; }
  `]
})
export class ProfitReport implements OnInit {
  courierData: CourierProfit[] = [];
  merchantData: MerchantProfit[] = [];

  constructor(private reportsService: ReportsService) {}

  get netProfit(): number {
    return this.courierData.reduce((sum, item) => sum + item.profit, 0);
  }

  get avgProfit(): number {
    const totalShipments = this.courierData.reduce((sum, item) => sum + item.shipments, 0);
    return totalShipments > 0 ? this.netProfit / totalShipments : 0;
  }

  get profitMargin(): number {
    const totalRevenue = this.courierData.reduce((sum, item) => sum + item.revenue, 0);
    return totalRevenue > 0 ? (this.netProfit / totalRevenue) * 100 : 0;
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportsService.getRevenueReport().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.courierData = response.data.courierProfits || [];
          this.merchantData = response.data.merchantProfits || [];
        }
      },
      error: (error) => {
        console.error('Error loading profit report:', error);
      }
    });
  }

  exportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to download report.');
      return;
    }

    const courierRows = this.courierData.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.name}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">${item.shipments}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">₹${item.revenue.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">₹${item.cost.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">₹${item.profit.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 500;">${item.margin}</span></td>
      </tr>
    `).join('');

    const merchantRows = this.merchantData.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.name}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">${item.shipments}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">₹${item.revenue.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">₹${item.cost.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">₹${item.profit.toLocaleString('en-IN')}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;"><span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 500;">${item.margin}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Profit Analysis Report - Vexaro</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header-table { width: 100%; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: rgb(11, 74, 111); }
            .title { text-align: right; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0 35px; }
            .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
            .stat-label { font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 500; }
            .stat-value { font-size: 20px; font-weight: bold; color: #0f172a; }

            .section-title { font-size: 15px; font-weight: bold; color: #334155; margin: 25px 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .trx-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; margin-bottom: 25px; }
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
              <td class="title">Profit Analysis Report</td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <div style="font-size: 13px; color: #475569;">
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Net Profit</span>
              <span class="stat-value" style="color: #16a34a;">₹${this.netProfit.toLocaleString('en-IN')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Average Profit / Order</span>
              <span class="stat-value">₹${this.avgProfit.toFixed(2)}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Net Profit Margin</span>
              <span class="stat-value">${this.profitMargin.toFixed(2)}%</span>
            </div>
          </div>

          <div class="section-title">Profits by Courier Partner</div>
          <table class="trx-table">
            <thead>
              <tr>
                <th>Courier Name</th>
                <th>Total Shipments</th>
                <th>Total Revenue</th>
                <th>Franchise Cost</th>
                <th>Net Profit</th>
                <th>Margin (%)</th>
              </tr>
            </thead>
            <tbody>
              ${courierRows}
            </tbody>
          </table>

          <div class="section-title">Profits by Merchant Customer</div>
          <table class="trx-table">
            <thead>
              <tr>
                <th>Merchant Name</th>
                <th>Total Shipments</th>
                <th>Total Revenue</th>
                <th>Franchise Cost</th>
                <th>Net Profit</th>
                <th>Margin (%)</th>
              </tr>
            </thead>
            <tbody>
              ${merchantRows}
            </tbody>
          </table>

          <div class="footer">
            <p>This is an automated performance report ledger statement.</p>
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
