import { CommonModule } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { FinanceService } from '../../../../services/finance.service';

interface DistributorPayment {
  paymentId: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

@Component({
  standalone: true,
  selector: 'app-distributor-payments',
  imports: [CommonModule],
  templateUrl: './distributor-payments.html',
  styleUrls: ['../../../../common-css/super-admin-distrubutore-tabs.css']
})
export class DistributorPayments implements OnInit {
  distributorId = input<string>('');

  payments: DistributorPayment[] = [];
  isLoading = false;
  error = '';

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.isLoading = true;
    this.error = '';

    const params: any = { page: 1, limit: 20 };
    const id = this.distributorId();
    if (id) params.userId = id;

    this.financeService.listPayments(params).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.payments ?? [];
        this.payments = raw.map((p: any) => ({
          paymentId:        (p._id as string)?.slice(-8)?.toUpperCase() ?? '—',
          amount:           p.amountRupees ?? p.amount ?? 0,
          date:             new Date(p.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            }),
          method:           p.paymentMethod ?? '—',
          status:           p.status ?? '—',
          razorpayOrderId:  p.razorpayOrderId ?? '—',
          razorpayPaymentId: p.razorpayPaymentId ?? '—',
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load payments.';
        this.isLoading = false;
      },
    });
  }
}
