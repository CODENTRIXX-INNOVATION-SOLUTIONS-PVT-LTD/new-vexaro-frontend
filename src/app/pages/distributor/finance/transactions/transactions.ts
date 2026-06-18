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
