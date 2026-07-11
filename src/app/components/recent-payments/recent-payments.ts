import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';

interface PaymentRow {
  paymentId: string;
  customer: string;
  amount: string;
  method: string;
  date: string;
}

@Component({
  selector: 'app-recent-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-payments.html',
  styleUrl: '../../common-css/super-admin-dashboard-page-bottom-table.css'
})
export class RecentPayments implements OnInit {
  private financeService = inject(FinanceService);

  payments = signal<PaymentRow[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    this.financeService.listTransactions({ limit: 5, page: 1 }).subscribe({
      next: (res) => {
        const transactions = res?.data?.transactions ?? [];
        this.payments.set(transactions.map((t: any) => ({
          paymentId: t._id?.substring(0, 8) || '—',
          customer: t.userId?.companyName || t.userId?.firstName || 'Unknown',
          amount: `₹${t.amount?.toLocaleString('en-IN') || '0'}`,
          method: t.type || 'Wallet',
          date: t.createdAt
            ? new Date(t.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })
            : '—',
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[RecentPayments] API error:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
