import { Component } from '@angular/core';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialStore, RechargeRequest } from '../../../shared/financial-store';

@Component({
  selector: 'app-admin-payment',
  standalone: true,
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './admin-payment.html',
  styleUrl: './admin-payment.css',
})
export class AdminPayment {
  activeTab: string = 'wallet';

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // Dashboard Overview Metrics
  paymentCards = [
    {
      title: 'Total Wallets Value',
      value: '₹89,000',
      icon: 'fas fa-wallet',
      bgColor: '#DBEAFE',
      iconColor: '#2563EB'
    },
    {
      title: 'Total Admin Commission',
      value: '₹2,000',
      icon: 'fas fa-percent',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Success Transactions',
      value: '2',
      icon: 'fas fa-exchange-alt',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: 'Pending Refunds',
      value: '1',
      icon: 'fas fa-undo-alt',
      bgColor: '#FEE2E2',
      iconColor: '#DC2626'
    }
  ];

  // Distributors & Wallets List
  distributors = [
    { id: 1, name: 'Express Distributors Ltd', balance: 45000, lastRechargeAmount: 10000, lastRechargeDate: '15 Jun 2026', status: 'Active' },
    { id: 2, name: 'Rapid Delivery Services', balance: 28500, lastRechargeAmount: 25000, lastRechargeDate: '15 Jun 2026', status: 'Active' },
    { id: 3, name: 'Logistics Pro Solutions', balance: 12000, lastRechargeAmount: 5000, lastRechargeDate: '14 Jun 2026', status: 'Active' },
    { id: 4, name: 'Safe Ship Carriers', balance: 3500, lastRechargeAmount: 2000, lastRechargeDate: '10 Jun 2026', status: 'Inactive' }
  ];

  // Form Model
  rechargeModel = {
    distributorId: '',
    amount: null as number | null,
    paymentMethod: 'UPI',
    referenceId: ''
  };

  // Transactions list
  payments = [
    {
      transactionId: 'TXN001',
      distributor: 'Express Distributors Ltd',
      rechargeAmount: 10000,
      adminCommission: 500,
      paymentMethod: 'UPI',
      date: '15 Jun 2026',
      status: 'Success'
    },
    {
      transactionId: 'TXN002',
      distributor: 'Rapid Delivery Services',
      rechargeAmount: 25000,
      adminCommission: 1250,
      paymentMethod: 'Bank Transfer',
      date: '15 Jun 2026',
      status: 'Success'
    },
    {
      transactionId: 'TXN003',
      distributor: 'Logistics Pro Solutions',
      rechargeAmount: 5000,
      adminCommission: 250,
      paymentMethod: 'Card',
      date: '14 Jun 2026',
      status: 'Failed'
    }
  ];

  // Refunds list
  refunds = [
    {
      refundId: 'RFD001',
      distributor: 'Express Distributors Ltd',
      originalTxn: 'TXN001',
      amount: 1500,
      reason: 'Excess charge correction',
      date: '16 Jun 2026',
      status: 'Processed'
    },
    {
      refundId: 'RFD002',
      distributor: 'Safe Ship Carriers',
      originalTxn: 'TXN004',
      amount: 2000,
      reason: 'Failed transaction refund',
      date: '12 Jun 2026',
      status: 'Pending'
    }
  ];

  quickRecharge(distributorId: number) {
    this.rechargeModel.distributorId = String(distributorId);
    this.activeTab = 'recharge';
  }

  submitRecharge() {
    if (!this.rechargeModel.distributorId || !this.rechargeModel.amount) {
      alert('Please fill out the distributor and amount fields.');
      return;
    }
    
    const selectedDist = this.distributors.find(d => d.id === Number(this.rechargeModel.distributorId));
    const amount = Number(this.rechargeModel.amount);
    
    alert(`Wallet Recharge of ₹${amount} for ${selectedDist ? selectedDist.name : 'Distributor'} processed successfully!`);
    
    // Add to transaction log
    this.payments.unshift({
      transactionId: 'TXN' + Math.floor(100 + Math.random() * 900),
      distributor: selectedDist ? selectedDist.name : 'Unknown Distributor',
      rechargeAmount: amount,
      adminCommission: parseFloat((amount * 0.05).toFixed(2)),
      paymentMethod: this.rechargeModel.paymentMethod,
      date: '17 Jun 2026',
      status: 'Success'
    });

    // Update balance
    if (selectedDist) {
      selectedDist.balance += amount;
      selectedDist.lastRechargeAmount = amount;
      selectedDist.lastRechargeDate = '17 Jun 2026';
    }

    // Recalculate top stats
    this.updateStatsCards();

    // Reset Form
    this.rechargeModel = {
      distributorId: '',
      amount: null,
      paymentMethod: 'UPI',
      referenceId: ''
    };
    
    this.activeTab = 'wallet';
  }

  get rechargeRequests() {
    return FinancialStore.requests;
  }

  approveRequest(req: RechargeRequest) {
    const dist = this.distributors.find(d => d.id === req.distributorId);
    if (dist) {
      dist.balance += req.amount;
      dist.lastRechargeAmount = req.amount;
      dist.lastRechargeDate = 'Today';
    }

    req.status = 'Approved';

    // Add to transaction log
    this.payments.unshift({
      transactionId: 'TXN' + Math.floor(100 + Math.random() * 900),
      distributor: req.distributorName,
      rechargeAmount: req.amount,
      adminCommission: parseFloat((req.amount * 0.05).toFixed(2)),
      paymentMethod: req.method,
      date: 'Today',
      status: 'Success'
    });

    this.updateStatsCards();
    alert(`Recharge request approved successfully! Wallet credited with ₹${req.amount.toLocaleString('en-IN')}.`);
  }

  rejectRequest(req: RechargeRequest) {
    req.status = 'Rejected';
    this.updateStatsCards();
    alert('Recharge request has been rejected.');
  }

  updateStatsCards() {
    const totalBalance = this.distributors.reduce((sum, d) => sum + d.balance, 0);
    const totalCommission = this.payments
      .filter(p => p.status === 'Success')
      .reduce((sum, p) => sum + p.adminCommission, 0);
    const successCount = this.payments.filter(p => p.status === 'Success').length;
    const pendingRefunds = this.refunds.filter(r => r.status === 'Pending').length;

    this.paymentCards = [
      {
        title: 'Total Wallets Value',
        value: '₹' + totalBalance.toLocaleString('en-IN'),
        icon: 'fas fa-wallet',
        bgColor: '#DBEAFE',
        iconColor: '#2563EB'
      },
      {
        title: 'Total Admin Commission',
        value: '₹' + totalCommission.toLocaleString('en-IN'),
        icon: 'fas fa-percent',
        bgColor: '#DCFCE7',
        iconColor: '#16A34A'
      },
      {
        title: 'Success Transactions',
        value: String(successCount),
        icon: 'fas fa-exchange-alt',
        bgColor: '#FEF3C7',
        iconColor: '#D97706'
      },
      {
        title: 'Pending Refunds',
        value: String(pendingRefunds),
        icon: 'fas fa-undo-alt',
        bgColor: '#FEE2E2',
        iconColor: '#DC2626'
      }
    ];
  }
}
