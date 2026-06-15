import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-payments',
  standalone: true,
  templateUrl: './recent-payments.html',
  styleUrl: '../../common-css/super-admin-dashboard-page-bottom-table.css'
})
export class RecentPayments {

  payments = [
    {
      paymentId: 'PAY001',
      customer: 'Rahul Sharma',
      amount: '₹12,500',
      method: 'UPI',
      date: '10 Jun 2026'
    },
    {
      paymentId: 'PAY002',
      customer: 'Priya Singh',
      amount: '₹8,200',
      method: 'Card',
      date: '10 Jun 2026'
    },
    {
      paymentId: 'PAY003',
      customer: 'Amit Verma',
      amount: '₹15,000',
      method: 'Net Banking',
      date: '09 Jun 2026'
    },
    {
      paymentId: 'PAY004',
      customer: 'Neha Gupta',
      amount: '₹9,800',
      method: 'UPI',
      date: '09 Jun 2026'
    },
    {
      paymentId: 'PAY005',
      customer: 'Rohan Patel',
      amount: '₹18,300',
      method: 'Card',
      date: '08 Jun 2026'
    }
  ];

}