import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-payments',
  imports: [],
  templateUrl: './merchant-payments.html',
  styleUrl: './merchant-payments.css',
})
export class MerchantPayments {

  payments = [
    {
      paymentId: 'PAY-1001',
      amount: 15000,
      method: 'UPI',
      date: '15 Jun 2026',
      status: 'Completed'
    },
    {
      paymentId: 'PAY-1002',
      amount: 8500,
      method: 'Bank Transfer',
      date: '12 Jun 2026',
      status: 'Pending'
    },
    {
      paymentId: 'PAY-1003',
      amount: 6200,
      method: 'Card',
      date: '10 Jun 2026',
      status: 'Failed'
    }
  ];

}