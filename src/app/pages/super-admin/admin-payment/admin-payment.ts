import { Component } from '@angular/core';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-payment',
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './admin-payment.html',
  styleUrl: './admin-payment.css',
})
export class AdminPayment {
paymentCards = [
  {
    title: 'Total Wallet Recharge',
    value: '₹12,50,000',
    icon: 'fas fa-wallet',
    bgColor: '#DBEAFE',
    iconColor: '#2563EB'
  },
  {
    title: 'Admin Earnings',
    value: '₹1,25,000',
    icon: 'fas fa-indian-rupee-sign',
    bgColor: '#DCFCE7',
    iconColor: '#16A34A'
  },
  {
    title: "Today's Earnings",
    value: '₹12,500',
    icon: 'fas fa-chart-line',
    bgColor: '#FEF3C7',
    iconColor: '#D97706'
  },
  {
    title: 'This Month Earnings',
    value: '₹3,45,000',
    icon: 'fas fa-calendar',
    bgColor: '#F3E8FF',
    iconColor: '#9333EA'
  },
  {
    title: 'Active Distributors',
    value: 245,
    icon: 'fas fa-users',
    bgColor: '#E0F2FE',
    iconColor: '#0284C7'
  },
  {
    title: 'Total Transactions',
    value: 1580,
    icon: 'fas fa-exchange-alt',
    bgColor: '#FEE2E2',
    iconColor: '#DC2626'
  }
];payments = [
  {
    transactionId: 'TXN001',
    distributor: 'ABC Distributor',
    rechargeAmount: 10000,
    adminCommission: 500,
    paymentMethod: 'UPI',
    date: '15 Aug 2026',
    status: 'Success'
  },
  {
    transactionId: 'TXN002',
    distributor: 'XYZ Distributor',
    rechargeAmount: 25000,
    adminCommission: 1250,
    paymentMethod: 'Bank Transfer',
    date: '15 Aug 2026',
    status: 'Success'
  },
  {
    transactionId: 'TXN003',
    distributor: 'Prime Distributor',
    rechargeAmount: 5000,
    adminCommission: 250,
    paymentMethod: 'Card',
    date: '14 Aug 2026',
    status: 'Failed'
  }
];
}
