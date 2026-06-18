import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

import { StatsCards } from '../../../../components/stats-cards/stats-cards';

@Component({
  selector: 'app-super-admin-merchant-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCards
  ],
  templateUrl: './super-admin-merchant-reports.html',
  styleUrl: '../super-admin-revenue-reports/super-admin-revenue-reports.css',
})
export class SuperAdminMerchantReports implements AfterViewInit {

  merchantCards = [
    {
      title: 'Total Merchants',
      value: 120,
      icon: 'fas fa-store',
      bgColor: '#DBEAFE',
      iconColor: '#2563EB'
    },
    {
      title: 'Active Merchants',
      value: 105,
      icon: 'fas fa-user-check',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'New This Month',
      value: 18,
      icon: 'fas fa-user-plus',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    }
  ];

  merchantInsights = [
    {
      title: 'Merchant Retention',
      value: '91%',
      icon: 'fas fa-users'
    },
    {
      title: 'Top Category',
      value: 'Fashion',
      icon: 'fas fa-tags'
    },
    {
      title: 'Inactive Merchants',
      value: '15',
      icon: 'fas fa-user-clock'
    }
  ];

  topMerchants = [
    {
      merchantName: 'Fashion Hub',
      orders: 850
    },
    {
      merchantName: 'Urban Store',
      orders: 720
    },
    {
      merchantName: 'Style Point',
      orders: 615
    }
  ];

  merchantCategories = [
    {
      category: 'Fashion',
      merchants: 42
    },
    {
      category: 'Electronics',
      merchants: 28
    },
    {
      category: 'Home Decor',
      merchants: 19
    }
  ];

  recentMerchants = [
    {
      merchantName: 'Trend Zone',
      city: 'Mumbai',
      joinedDate: '12 Aug 2026',
      status: 'Active'
    },
    {
      merchantName: 'Fashion Street',
      city: 'Delhi',
      joinedDate: '10 Aug 2026',
      status: 'Pending'
    },
    {
      merchantName: 'Smart Mart',
      city: 'Pune',
      joinedDate: '08 Aug 2026',
      status: 'Active'
    }
  ];

  ngAfterViewInit(): void {

    new Chart('merchantGrowthChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Merchants',
          data: [55, 65, 78, 88, 102, 120],
          borderColor: '#2563eb',
          backgroundColor: '#2563eb',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart('merchantCategoryChart', {
      type: 'doughnut',
      data: {
        labels: [
          'Fashion',
          'Electronics',
          'Home Decor',
          'Beauty'
        ],
        datasets: [{
          data: [42, 28, 19, 12]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }

}