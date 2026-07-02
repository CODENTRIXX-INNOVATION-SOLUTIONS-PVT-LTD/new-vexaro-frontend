import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-invoices',
  imports: [],
  templateUrl: './merchant-invoices.html',
  styleUrl: './merchant-invoices.css',
})
export class MerchantInvoices {

  invoices = [
    {
      invoiceNo: 'INV-1001',
      amount: 12500,
      date: '15 Jun 2026',
      status: 'Paid'
    },
    {
      invoiceNo: 'INV-1002',
      amount: 8500,
      date: '12 Jun 2026',
      status: 'Pending'
    },
    {
      invoiceNo: 'INV-1003',
      amount: 6700,
      date: '08 Jun 2026',
      status: 'Overdue'
    }
  ];

}