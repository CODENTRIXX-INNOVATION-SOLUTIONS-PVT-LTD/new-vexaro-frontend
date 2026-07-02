import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';
import { ReportsService } from '../../../../services/reports.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-super-admin-revenue-reports',
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './super-admin-revenue-reports.html',
  styleUrl: './super-admin-revenue-reports.css',
})
export class SuperAdminRevenueReports implements OnInit {
  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);
  
  selectedPeriod = 'This Month';
  isLoading = false;

  revenueCards = [
    {
      title: 'Daily Revenue',
      value: '₹0',
      icon: 'fas fa-rupee-sign',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Weekly Revenue',
      value: '₹0',
      icon: 'fas fa-chart-line',
      bgColor: '#DBEAFE',
      iconColor: 'rgb(11, 74, 111)'
    },
    {
      title: 'Monthly Revenue',
      value: '₹0',
      icon: 'fas fa-wallet',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: 'Yearly Revenue',
      value: '₹0',
      icon: 'fas fa-coins',
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    }
  ];

  revenueInsights = [
    {
      title: 'Profit Margin',
      value: '0%',
      icon: 'fas fa-percent'
    },
    {
      title: 'Average Order Value',
      value: '₹0',
      icon: 'fas fa-shopping-cart'
    },
    {
      title: 'Refund Amount',
      value: '₹0',
      icon: 'fas fa-undo'
    }
  ];

  topRevenueMerchants: any[] = [];
  paymentMethods: any[] = [];
  recentTransactions: any[] = [];

  ngOnInit() {
    this.loadRevenueData();
  }

  loadRevenueData() {
    this.isLoading = true;
    
    // Load revenue summary
    this.reportsService.getRevenueSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.revenueCards[0].value = '₹' + (res.data.daily || 0).toLocaleString('en-IN');
          this.revenueCards[1].value = '₹' + (res.data.weekly || 0).toLocaleString('en-IN');
          this.revenueCards[2].value = '₹' + ((res.data.monthly || 0) / 100000).toFixed(1) + 'L';
          this.revenueCards[3].value = '₹' + ((res.data.yearly || 0) / 10000000).toFixed(1) + 'Cr';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading revenue summary:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load revenue insights
    this.reportsService.getRevenueInsights().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.revenueInsights[0].value = (res.data.profitMargin || 0) + '%';
          this.revenueInsights[1].value = '₹' + (res.data.averageOrderValue || 0).toLocaleString('en-IN');
          this.revenueInsights[2].value = '₹' + (res.data.refundAmount || 0).toLocaleString('en-IN');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading revenue insights:', err);
      }
    });

    // Load top merchants
    this.reportsService.getTopRevenueMerchants({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.topRevenueMerchants = (res.data.merchants || []).map((m: any) => ({
            merchantName: m.merchantName || 'Unknown',
            revenue: '₹' + (m.revenue || 0).toLocaleString('en-IN'),
            orders: m.orders || 0
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading top merchants:', err);
      }
    });

    // Load payment methods
    this.reportsService.getRevenueByPaymentMethod().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.paymentMethods = (res.data.methods || []).map((m: any) => ({
            method: m.method || 'Unknown',
            transactions: m.transactions || 0,
            revenue: '₹' + (m.revenue || 0).toLocaleString('en-IN')
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading payment methods:', err);
      }
    });

    // Load recent transactions
    this.reportsService.getRecentRevenueTransactions({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentTransactions = (res.data.transactions || []).map((t: any) => ({
            transactionId: t._id?.substring(0, 8) || '—',
            merchant: t.userId?.companyName || t.userId?.firstName || 'Unknown',
            amount: '₹' + (t.amount || 0).toLocaleString('en-IN'),
            status: t.status || 'Success'
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recent transactions:', err);
      }
    });

    // Load revenue trend
    this.reportsService.getRevenueTrend({ period: 'month' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderTrendChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading revenue trend:', err);
      }
    });

    // Load revenue source
    this.reportsService.getRevenueSource().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderSourceChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading revenue source:', err);
      }
    });
  }

  renderTrendChart(data: any) {
    const ctx = document.getElementById('revenueTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: data.values || [120000, 180000, 150000, 220000, 280000, 350000],
            borderColor: 'rgb(11, 74, 111)',
            backgroundColor: 'rgb(11, 74, 111)',
            tension: 0.4
          }
        ]
      }
    });
  }

  renderSourceChart(data: any) {
    const ctx = document.getElementById('revenueSourceChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels || ['Merchant Sales', 'Subscriptions', 'Commissions', 'Delivery Charges'],
        datasets: [
          {
            data: data.values || [55, 15, 20, 10],
            backgroundColor: data.colors || ['rgb(11, 74, 111)', '#16a34a', '#d97706', '#9333ea']
          }
        ]
      }
    });
  }
}
