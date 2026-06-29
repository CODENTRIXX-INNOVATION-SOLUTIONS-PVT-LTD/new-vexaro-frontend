import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DisputeClaim {
  id: string;
  awb: string;
  merchantName: string;
  claimType: string;
  amount: number;
  status: 'Approved' | 'Rejected' | 'Pending Review';
  resolvedDate: string;
}

@Component({
  selector: 'app-dispute-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon title-icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 9v4M12 17h.01"></path></svg> 
          Dispute Report
        </h1>
        <div class="actions">
          <button class="action-btn" (click)="exportPDF()">Download PDF Report</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Disputes Raised</span>
          <span class="stat-value">12</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Claims Recovered</span>
          <span class="stat-value">₹1,500</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Dispute Success Rate</span>
          <span class="stat-value">67%</span>
        </div>
      </div>

      <div class="section-title">Disputes Audit History</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>AWB Code</th>
              <th>Merchant Name</th>
              <th>Dispute Category</th>
              <th>Disputed Amount</th>
              <th>Status</th>
              <th>Resolution Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of claimsData">
              <td class="fw-bold">{{item.id}}</td>
              <td>{{item.awb}}</td>
              <td>{{item.merchantName}}</td>
              <td>{{item.claimType}}</td>
              <td>₹{{item.amount}}</td>
              <td>
                <span class="status-badge"
                  [class.approved]="item.status === 'Approved'"
                  [class.rejected]="item.status === 'Rejected'"
                  [class.pending]="item.status === 'Pending Review'">
                  {{item.status}}
                </span>
              </td>
              <td>{{item.resolvedDate}}</td>
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
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .fw-bold { font-weight: 600; color: #0f172a; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; display: inline-block; }
    .status-badge.approved { background: #dcfce7; color: #15803d; }
    .status-badge.rejected { background: #fee2e2; color: #b91c1c; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
  `]
})
export class DisputeReport implements OnInit {
  claimsData: DisputeClaim[] = [
    { id: 'DSP-8821', awb: 'AWB990123', merchantName: 'Fashion Hub', claimType: 'Weight Mismatch', amount: 150, status: 'Pending Review', resolvedDate: '—' },
    { id: 'DSP-8822', awb: 'AWB771234', merchantName: 'Tech Store', claimType: 'Weight Mismatch', amount: 320, status: 'Pending Review', resolvedDate: '—' },
    { id: 'DSP-8823', awb: 'AWB662345', merchantName: 'Home Goods', claimType: 'Lost Package', amount: 1200, status: 'Approved', resolvedDate: '15 Jun 2026' },
    { id: 'DSP-8824', awb: 'AWB553456', merchantName: 'Beauty Co', claimType: 'Damaged Item', amount: 300, status: 'Approved', resolvedDate: '12 Jun 2026' },
    { id: 'DSP-8825', awb: 'AWB449102', merchantName: 'ABC Electronics', claimType: 'Weight Mismatch', amount: 250, status: 'Rejected', resolvedDate: '10 Jun 2026' }
  ];

  ngOnInit() {}

  exportPDF() {
    alert('Generating PDF report for download...');
  }
}
