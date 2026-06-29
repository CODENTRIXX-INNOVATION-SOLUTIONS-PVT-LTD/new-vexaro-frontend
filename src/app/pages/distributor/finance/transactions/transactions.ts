import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}
