import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merchant-revenue-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title"><i class="fas fa-file-invoice-dollar"></i> Merchant Revenue Report</h1>
      </div>
      <div class="empty-state">
        <i class="fas fa-tools"></i>
        <h3>Under Construction</h3>
        <p>Merchant revenue reporting will be available in the next release.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
    .page-title i { color: #6366f1; margin-right: 8px; }
    .empty-state { text-align: center; padding: 64px 24px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .empty-state i { font-size: 48px; color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .empty-state p { color: #64748b; margin: 0; }
  `]
})
export class MerchantRevenueReport implements OnInit {
  ngOnInit() {}
}
