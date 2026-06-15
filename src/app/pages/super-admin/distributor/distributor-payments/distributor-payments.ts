import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-distributor-payments',
  imports: [CommonModule],
  templateUrl: './distributor-payments.html',

  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorPayments {
payments = [
  {
    paymentId: 'PAY1001',
    amount: 25000,
    date: '2026-06-10',
    method: 'Bank Transfer',
    status: 'Paid'
  },
  {
    paymentId: 'PAY1002',
    amount: 18000,
    date: '2026-06-12',
    method: 'UPI',
    status: 'Paid'
  },
  {
    paymentId: 'PAY1003',
    amount: 32000,
    date: '2026-06-14',
    method: 'Bank Transfer',
    status: 'Pending'
  }
];
}
