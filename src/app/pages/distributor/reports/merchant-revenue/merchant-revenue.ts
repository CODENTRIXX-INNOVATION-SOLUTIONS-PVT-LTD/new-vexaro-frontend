import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          <button class="action-btn" (click)="exportCSV()">Export CSV</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Revenue</span>
          <span class="stat-value">₹{{totalRevenue.toLocaleString('en-IN')}}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Shipments</span>
          <span class="stat-value">{{totalShipments}}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Franchise Profit Share</span>
          <span class="stat-value">₹{{totalProfit.toLocaleString('en-IN')}}</span>
        </div>
      </div>

      <div class="filter-bar">
        <input type="text" placeholder="Search merchant..." [(ngModel)]="searchTerm" (input)="applyFilters()" class="search-input">
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Merchant Name</th>
              <th>Merchant Code</th>
              <th>Total Shipments</th>
              <th>Total Revenue</th>
              <th>COD Remitted</th>
              <th>COD Pending</th>
              <th>Franchise Share</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredData">
              <td class="fw-bold">{{item.name}}</td>
              <td>{{item.id}}</td>
              <td>{{item.shipments}}</td>
              <td>₹{{item.revenue.toLocaleString('en-IN')}}</td>
              <td>₹{{item.codRemitted.toLocaleString('en-IN')}}</td>
              <td>₹{{item.codPending.toLocaleString('en-IN')}}</td>
              <td>₹{{item.franchiseShare.toLocaleString('en-IN')}}</td>
            </tr>
            <tr *ngIf="filteredData.length === 0">
              <td colspan="7" class="text-center py-4">No data found matching your query.</td>
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
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
    .stat-label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .filter-bar { margin-bottom: 16px; }
    .search-input { width: 100%; max-width: 300px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; }
    .search-input:focus { border-color: rgb(11, 74, 111); }
    .table-wrapper { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:last-child td { border-bottom: none; }
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
    alert('Downloading CSV...');
  }
}
