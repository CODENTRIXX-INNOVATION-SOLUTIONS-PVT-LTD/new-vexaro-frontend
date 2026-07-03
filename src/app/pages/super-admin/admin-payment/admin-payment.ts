import { Component, inject, OnInit } from '@angular/core';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialStore, RechargeRequest } from '../../../shared/financial-store';
import { FinanceService } from '../../../services/finance.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-payment',
  standalone: true,
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './admin-payment.html',
  styleUrl: './admin-payment.css',
})
export class AdminPayment implements OnInit {
  private financeService = inject(FinanceService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: string = 'wallet';
  isLoading: boolean = false;
  error: string = '';

  // Dashboard Overview Metrics
  paymentCards = [
    {
      title: 'Total Wallets Value',
      value: '₹0',
      icon: 'fas fa-wallet',
      bgColor: '#DBEAFE',
      iconColor: 'rgb(11, 74, 111)'
    },
    {
      title: 'Total Admin Commission',
      value: '₹0',
      icon: 'fas fa-percent',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Success Transactions',
      value: '0',
      icon: 'fas fa-exchange-alt',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: 'Pending Refunds',
      value: '0',
      icon: 'fas fa-undo-alt',
      bgColor: '#FEE2E2',
      iconColor: '#DC2626'
    }
  ];

  // Distributors & Wallets List
  distributors: any[] = [];

  // Form Model
  rechargeModel = {
    distributorId: '',
    amount: null as number | null,
    paymentMethod: 'UPI',
    referenceId: ''
  };

  // Transactions list
  payments: any[] = [];

  // Refunds list
  refunds: any[] = [];

  // Recharge requests
  rechargeRequestsData: any[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load all data in parallel
    this.financeService.getAdminStats().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.paymentCards = [
            {
              title: 'Total Wallets Value',
              value: '₹' + (res.data.totalWalletValue || 0).toLocaleString('en-IN'),
              icon: 'fas fa-wallet',
              bgColor: '#DBEAFE',
              iconColor: 'rgb(11, 74, 111)'
            },
            {
              title: 'Total Admin Commission',
              value: '₹' + (res.data.totalCommission || 0).toLocaleString('en-IN'),
              icon: 'fas fa-percent',
              bgColor: '#DCFCE7',
              iconColor: '#16A34A'
            },
            {
              title: 'Success Transactions',
              value: String(res.data.successTransactions || 0),
              icon: 'fas fa-exchange-alt',
              bgColor: '#FEF3C7',
              iconColor: '#D97706'
            },
            {
              title: 'Pending Refunds',
              value: String(res.data.pendingRefunds || 0),
              icon: 'fas fa-undo-alt',
              bgColor: '#FEE2E2',
              iconColor: '#DC2626'
            }
          ];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admin stats:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.loadDistributors();
    this.loadTransactions();
    this.loadRefunds();
    this.loadRechargeRequests();
  }

  loadDistributors() {
    this.financeService.listWallets({ limit: 100 }).subscribe({
      next: (res) => {
        this.distributors = (res?.data?.wallets || [])
          .filter((w: any) => w.userId?.role === 'DISTRIBUTOR')
          .map((w: any) => ({
          id: w.userId?._id || w._id,
          name: w.userId?.companyName || w.userId?.firstName || 'Unknown',
          balance: w.balance || 0,
          lastRechargeAmount: w.lastRechargeAmount || 0,
          lastRechargeDate: w.lastRechargeDate 
            ? new Date(w.lastRechargeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A',
          status: w.status || 'Active'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading wallets:', err);
      }
    });
  }

  loadTransactions() {
    this.financeService.listTransactions({ limit: 50 }).subscribe({
      next: (res) => {
        this.payments = (res?.data?.transactions || []).map((t: any) => ({
          transactionId: t._id?.substring(0, 8) || '—',
          distributor: t.userId?.companyName || t.userId?.firstName || 'Unknown',
          rechargeAmount: t.amount || 0,
          adminCommission: t.commission || 0,
          paymentMethod: t.type || 'Wallet',
          date: t.createdAt
            ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          status: t.status || 'Success'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
      }
    });
  }

  loadRefunds() {
    this.financeService.listRefunds({ limit: 50 }).subscribe({
      next: (res) => {
        this.refunds = (res?.data?.refunds || []).map((r: any) => ({
          refundId: r._id?.substring(0, 8) || '—',
          distributor: r.userId?.companyName || r.userId?.firstName || 'Unknown',
          originalTxn: r.originalTransactionId?.substring(0, 8) || '—',
          amount: r.amount || 0,
          reason: r.reason || '—',
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          status: r.status || 'Pending'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading refunds:', err);
      }
    });
  }

  loadRechargeRequests() {
    this.financeService.listRechargeRequests({ limit: 50 }).subscribe({
      next: (res) => {
        this.rechargeRequestsData = (res?.data?.requests || []).map((r: any) => ({
          requestId: r._id?.substring(0, 8) || '—',
          distributorName: r.userId?.companyName || r.userId?.firstName || 'Unknown',
          distributorId: r.userId?._id,
          amount: r.amount || 0,
          method: r.paymentMethod || 'UPI',
          reference: r.referenceId || '—',
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          status: r.status || 'Pending'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recharge requests:', err);
      }
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  quickRecharge(distributorId: string) {
    this.rechargeModel.distributorId = distributorId;
    this.activeTab = 'recharge';
  }

  submitRecharge() {
    if (!this.rechargeModel.distributorId || !this.rechargeModel.amount) {
      alert('Please fill out the distributor and amount fields.');
      return;
    }
    
    this.isLoading = true;
    
    this.financeService.rechargeDistributorWallet({
      distributorId: this.rechargeModel.distributorId,
      amount: Number(this.rechargeModel.amount),
      paymentMethod: this.rechargeModel.paymentMethod,
      referenceId: this.rechargeModel.referenceId
    }).subscribe({
      next: (res) => {
        alert(`Wallet Recharge of ₹${this.rechargeModel.amount} processed successfully!`);
        this.rechargeModel = {
          distributorId: '',
          amount: null,
          paymentMethod: 'UPI',
          referenceId: ''
        };
        this.activeTab = 'wallet';
        this.loadDashboardData();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to process recharge. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get rechargeRequests() {
    return this.rechargeRequestsData;
  }

  get successfulPayments() {
    return this.payments.filter(p => p.status === 'Success');
  }

  approveRequest(req: any) {
    this.isLoading = true;
    this.financeService.approveRechargeRequest(req.requestId).subscribe({
      next: (res) => {
        alert(`Recharge request approved successfully!`);
        this.loadDashboardData();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to approve request. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  rejectRequest(req: any) {
    this.isLoading = true;
    this.financeService.rejectRechargeRequest(req.requestId).subscribe({
      next: (res) => {
        alert('Recharge request has been rejected.');
        this.loadDashboardData();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to reject request. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
