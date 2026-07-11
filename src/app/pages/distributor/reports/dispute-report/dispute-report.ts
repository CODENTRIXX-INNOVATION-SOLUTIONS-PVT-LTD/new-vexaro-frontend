import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisputeService } from '../../../../services/dispute.service';
import { CsvExportService } from '../../../../shared/csv-export.service';

const CATEGORY_LABELS: Record<string, string> = {
  WEIGHT_DISPUTE: 'Weight Mismatch', LOST: 'Lost Package',
  DAMAGED: 'Damaged', DELAY: 'Delivery Delay',
  WRONG_DELIVERY: 'Wrong Delivery', COD_MISMATCH: 'COD Mismatch', OTHER: 'Other',
};

@Component({
  selector: 'app-dispute-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispute-report.html',
  styleUrl: './dispute-report.css',
})
export class DisputeReport implements OnInit {
  private disputeService = inject(DisputeService);
  private csvService     = inject(CsvExportService);

  isLoading = false;
  error     = '';
  disputes: any[] = [];

  totalCount   = 0;
  resolvedCount = 0;
  openCount    = 0;
  totalCharge  = 0;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';
    this.disputeService.listDisputes({ limit: 100 }).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.disputes ?? res?.data?.items ?? [];
        this.disputes = raw.map(d => ({
          id:           d._id,
          awb:          d.shipmentId?.awb ?? '—',
          merchantName: d.raisedBy ? `${d.raisedBy.firstName ?? ''} ${d.raisedBy.lastName ?? ''}`.trim() : '—',
          category:     CATEGORY_LABELS[d.category] ?? d.category ?? '—',
          charge:       d.extraCharge ?? 0,
          status:       d.status,
          resolvedDate: d.status === 'RESOLVED' || d.status === 'CLOSED'
            ? new Date(d.updatedAt ?? d.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—',
        }));
        this.totalCount    = this.disputes.length;
        this.resolvedCount = this.disputes.filter(d => d.status === 'RESOLVED').length;
        this.openCount     = this.disputes.filter(d => d.status === 'OPEN').length;
        this.totalCharge   = this.disputes.reduce((s, d) => s + d.charge, 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load disputes.';
        this.isLoading = false;
      },
    });
  }

  exportCSV(): void {
    const headers = ['AWB', 'Merchant', 'Category', 'Extra Charge', 'Status', 'Resolved Date'];
    const rows = this.disputes.map(d => [d.awb, d.merchantName, d.category, d.charge, d.status, d.resolvedDate]);
    this.csvService.export('distributor_dispute_report', headers, rows);
  }
}
