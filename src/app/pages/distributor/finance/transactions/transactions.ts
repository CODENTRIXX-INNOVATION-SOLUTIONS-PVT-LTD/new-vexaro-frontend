import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FinanceService } from '../../../../services/finance.service';
import { CsvExportService } from '../../../../shared/csv-export.service';

export interface Transaction {
  id: string;
  date: string;       // display string e.g. "15 Jan 2025"
  rawDate: string;    // ISO date string e.g. "2025-01-15" — used for filtering
  type: 'Credit' | 'Debit';
  category: string;
  amount: number;
  status: string;
  reference: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private financeService = inject(FinanceService);
  private csvService = inject(CsvExportService);
  private route = inject(ActivatedRoute);

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading = false;

  // Filters
  dateFilter = '';
  typeFilter = 'All';

  // Optional: scope to a specific merchant when coming from merchant-finance route
  private merchantId = '';

  private readonly CREDIT_TYPES = ['CREDIT', 'TOPUP', 'REFUND', 'COD_CREDIT', 'TRANSFER_CREDIT', 'COMMISSION'];

  ngOnInit() {
    this.merchantId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    const params: any = { limit: 100 };
    if (this.merchantId) params.userId = this.merchantId;

    this.financeService.listTransactions(params).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.transactions ?? [];
        this.transactions = raw.map((t: any) => ({
          id: t._id,
          date: t.createdAt
            ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
          rawDate: t.createdAt
            ? new Date(t.createdAt).toISOString().slice(0, 10) // "YYYY-MM-DD" for date input comparison
            : '',
          type: this.CREDIT_TYPES.includes(t.type) ? 'Credit' : 'Debit',
          category: this.formatCategory(t.type),
          amount: Math.abs(t.amount ?? 0),
          status: 'Completed',
          reference: t.reference || '—',
        }));
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.isLoading = false;
      },
    });
  }

  private formatCategory(type: string): string {
    const map: Record<string, string> = {
      CREDIT: 'Wallet Credit',
      DEBIT: 'Wallet Debit',
      TOPUP: 'Wallet Top-up',
      REFUND: 'Refund',
      CHARGE: 'Courier Charge',
      COD_CREDIT: 'COD Credit',
      TRANSFER_DEBIT: 'Merchant Funding',
      TRANSFER_CREDIT: 'Wallet Transfer',
      DISPUTE_CHARGE: 'Dispute Deduction',
      RTO_CHARGE: 'RTO Charge',
      SETTLEMENT: 'Settlement',
      COMMISSION: 'Margin Profit',
    };
    return map[type] ?? type;
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter((t) => {
      // Compare against rawDate (YYYY-MM-DD) which matches the date input value format
      const matchesDate = !this.dateFilter || t.rawDate === this.dateFilter;
      const matchesType = this.typeFilter === 'All' || t.type === this.typeFilter;
      return matchesDate && matchesType;
    });
  }

  exportCSV() {
    const headers = ['Date', 'Transaction ID', 'Type', 'Category', 'Amount', 'Status', 'Reference'];
    const rows = this.filteredTransactions.map((t) => [
      t.date, t.id, t.type, t.category, t.amount, t.status, t.reference,
    ]);
    this.csvService.export('transactions_export', headers, rows);
  }

  downloadStatement() {
    if (!this.filteredTransactions.length) {
      alert('No transactions to generate a statement.');
      return;
    }
    const win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked. Please allow pop-ups to view the statement.'); return; }

    const rowsHtml = this.filteredTransactions.map((t) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${t.date}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;">${t.id}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${t.type}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${t.category}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;color:${t.type === 'Credit' ? '#16a34a' : '#dc2626'};">
          ${t.type === 'Credit' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}
        </td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${t.status}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;">${t.reference}</td>
      </tr>`).join('');

    win.document.write(`<html><head><title>Statement – Vexaro</title></head><body style="font-family:sans-serif;padding:40px;">
      <h2 style="color:rgb(11,74,111);">VEXARO – Account Statement</h2>
      <p style="color:#64748b;">Generated: ${new Date().toLocaleString('en-IN')}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead><tr style="background:#f8fafc;">
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Date</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Txn ID</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Type</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Category</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Amount</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Status</th>
          <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Reference</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="margin-top:40px;text-align:center;color:#94a3b8;font-size:12px;">Vexaro Courier Solutions © ${new Date().getFullYear()}</p>
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
    win.document.close();
  }
}
