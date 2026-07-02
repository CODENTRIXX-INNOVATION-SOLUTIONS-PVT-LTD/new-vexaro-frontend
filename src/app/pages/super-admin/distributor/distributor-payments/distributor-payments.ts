import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../../services/finance.service';

interface DistributorPayment {
  paymentId: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-distributor-payments',
  imports: [CommonModule],
  templateUrl: './distributor-payments.html',
  styleUrls: ['../../../../common-css/super-admin-distrubutore-tabs.css']
})
export class DistributorPayments implements OnInit {
  payments: DistributorPayment[] = [];
  isLoading = false;
  error = '';

  constructor(private financeService: FinanceService) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.isLoading = true;
    this.error = '';

    this.financeService.listTransactions({ page: 1, limit: 20 }).subscribe({
      next: (res) => {
        this.payments = (res.data?.transactions ?? []).map((tx: any) => ({
          paymentId: tx._id || tx.transactionId || '—',
          amount: tx.amount || 0,
          date: new Date(tx.createdAt || tx.transactionDate || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          method: tx.paymentMethod || tx.method || '—',
          status: tx.status || 'Unknown',
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load payments.';
        this.isLoading = false;
      }
    });
  }
}
