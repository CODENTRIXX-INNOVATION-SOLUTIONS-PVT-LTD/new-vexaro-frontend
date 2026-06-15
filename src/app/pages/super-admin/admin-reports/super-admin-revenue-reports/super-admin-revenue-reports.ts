import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';

@Component({
  selector: 'app-super-admin-revenue-reports',
  imports: [StatsCards, CommonModule, FormsModule],
  templateUrl: './super-admin-revenue-reports.html',
  styleUrl: './super-admin-revenue-reports.css',
})
export class SuperAdminRevenueReports {
  selectedPeriod = 'This Month';

 ngAfterViewInit(): void {

    // Revenue Trend Chart

    new Chart('revenueTrendChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [120000, 180000, 150000, 220000, 280000, 350000],
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            tension: 0.4
          }
        ]
      }
    });

    // Revenue Source Chart

    new Chart('revenueSourceChart', {
      type: 'doughnut',
      data: {
        labels: [
          'Merchant Sales',
          'Subscriptions',
          'Commissions',
          'Delivery Charges'
        ],
        datasets: [
          {
            data: [55, 15, 20, 10],
            backgroundColor: [
              '#2563eb',
              '#16a34a',
              '#d97706',
              '#9333ea'
            ]
          }
        ]
      }
    });

  }
  revenueInsights = [
    {
      title: 'Profit Margin',
      value: '28%',
      icon: 'fas fa-percent'
    },
    {
      title: 'Average Order Value',
      value: '₹2,450',
      icon: 'fas fa-shopping-cart'
    },
    {
      title: 'Refund Amount',
      value: '₹18,200',
      icon: 'fas fa-undo'
    }
  ];

  topRevenueMerchants = [
    {
      merchantName: 'Fashion Hub',
      revenue: '₹8,50,000',
      orders: 420
    },
    {
      merchantName: 'Urban Store',
      revenue: '₹6,80,000',
      orders: 315
    },
    {
      merchantName: 'Style Point',
      revenue: '₹5,10,000',
      orders: 280
    }
  ];

  paymentMethods = [
    {
      method: 'UPI',
      transactions: 4200,
      revenue: '₹12,50,000'
    },
    {
      method: 'Credit Card',
      transactions: 1850,
      revenue: '₹8,20,000'
    },
    {
      method: 'Net Banking',
      transactions: 920,
      revenue: '₹4,10,000'
    }
  ];

  recentTransactions = [
    {
      transactionId: 'TXN1001',
      merchant: 'Fashion Hub',
      amount: '₹4,500',
      status: 'Success'
    },
    {
      transactionId: 'TXN1002',
      merchant: 'Urban Store',
      amount: '₹2,800',
      status: 'Pending'
    },
    {
      transactionId: 'TXN1003',
      merchant: 'Style Point',
      amount: '₹6,200',
      status: 'Success'
    }
  ];
  revenueCards = [
    {
      title: 'Daily Revenue',
      value: '₹12,500',
      icon: 'fas fa-rupee-sign',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Weekly Revenue',
      value: '₹82,000',
      icon: 'fas fa-chart-line',
      bgColor: '#DBEAFE',
      iconColor: '#2563EB'
    },
    {
      title: 'Monthly Revenue',
      value: '₹3.5L',
      icon: 'fas fa-wallet',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: 'Yearly Revenue',
      value: '₹42L',
      icon: 'fas fa-coins',
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    }
  ];




}
