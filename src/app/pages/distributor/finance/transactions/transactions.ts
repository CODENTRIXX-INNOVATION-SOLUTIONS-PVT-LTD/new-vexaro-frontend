import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvExportService } from '../../../../shared/csv-export.service';

export interface Transaction {
  id: string;
  date: string;
  type: 'Credit' | 'Debit';
  category: 'Wallet Topup' | 'Merchant Wallet Funding' | 'Courier Charge' | 'Dispute Deduction' | 'Margin Profit';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = false;

  dateFilter: string = '';
  typeFilter: string = 'All';

  private csvService = inject(CsvExportService);

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/transactions
    this.transactions = [
      { id: 'TXN8001', date: '17 Jun 2026', type: 'Credit', category: 'Wallet Topup', amount: 50000, status: 'Completed', reference: 'REQ1003' },
      { id: 'TXN8002', date: '17 Jun 2026', type: 'Debit', category: 'Merchant Wallet Funding', amount: 10000, status: 'Completed', reference: 'MWF9901' },
      { id: 'TXN8003', date: '16 Jun 2026', type: 'Credit', category: 'Margin Profit', amount: 4500, status: 'Completed', reference: 'MP9982' },
      { id: 'TXN8004', date: '15 Jun 2026', type: 'Debit', category: 'Courier Charge', amount: 320, status: 'Completed', reference: 'AWB889012' },
      { id: 'TXN8005', date: '14 Jun 2026', type: 'Debit', category: 'Dispute Deduction', amount: 150, status: 'Completed', reference: 'DIS1001' }
    ];
    this.isLoading = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter(t => {
      const matchesDate = !this.dateFilter || t.date.includes(this.dateFilter);
      const matchesType = this.typeFilter === 'All' || t.type === this.typeFilter;
      return matchesDate && matchesType;
    });
  }

  exportCSV() {
    const headers = ['Date', 'Transaction ID', 'Type', 'Category', 'Amount', 'Status', 'Reference'];
    const rows = this.filteredTransactions.map(t => [
      t.date,
      t.id,
      t.type,
      t.category,
      t.amount,
      t.status,
      t.reference
    ]);
    this.csvService.export('transactions_export', headers, rows);
  }

  downloadStatement() {
    if (this.filteredTransactions.length === 0) {
      alert('No transactions to generate statement.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow popups to view statement.');
      return;
    }

    const rowsHtml = this.filteredTransactions.map(t => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.date}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${t.id}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.type}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: ${t.type === 'Credit' ? '#16a34a' : '#dc2626'}">${t.type === 'Credit' ? '+' : '-'}₹${t.amount}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.status}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${t.reference}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Account Statement - Vexaro</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header-table { width: 100%; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: rgb(11, 74, 111); }
            .title { text-align: right; font-size: 20px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .meta-section { margin-bottom: 30px; font-size: 14px; color: #475569; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .meta-table td { padding: 6px 0; }
            .trx-table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
            .trx-table th { background: #f8fafc; padding: 12px 10px; font-weight: 600; color: #64748b; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo">VEXARO</td>
              <td class="title">Account Statement</td>
            </tr>
          </table>

          <div class="meta-section">
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
            <table class="meta-table">
              <tr>
                <td><strong>Statement Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style="text-align: right;"><strong>Filtered By:</strong> ${this.typeFilter === 'All' ? 'All Transactions' : this.typeFilter}</td>
              </tr>
            </table>
          </div>

          <table class="trx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated account statement and does not require a physical signature.</p>
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
