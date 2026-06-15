import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';

@Component({
  selector: 'app-super-admin-distributor-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCards
  ],
  templateUrl: './super-admin-distributor-reports.html',
  styleUrl: '../super-admin-revenue-reports/super-admin-revenue-reports.css',
})
export class SuperAdminDistributorReports implements AfterViewInit {

  distributorCards = [
    {
      title: 'Assigned Deliveries',
      value: 1250,
      icon: 'fas fa-truck',
      bgColor: '#DBEAFE',
      iconColor: '#2563EB'
    },
    {
      title: 'Delivered',
      value: 980,
      icon: 'fas fa-check-circle',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Failed Deliveries',
      value: 45,
      icon: 'fas fa-times-circle',
      bgColor: '#FEE2E2',
      iconColor: '#DC2626'
    },
    {
      title: 'COD Collected',
      value: '₹2.8L',
      icon: 'fas fa-wallet',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    }
  ];

  distributorInsights = [
    {
      title: 'Success Rate',
      value: '94%',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'Average Delivery Time',
      value: '1.8 Days',
      icon: 'fas fa-clock'
    },
    {
      title: 'Active Distributors',
      value: '186',
      icon: 'fas fa-users'
    }
  ];

  topDistributors = [
    {
      distributorName: 'Raj Logistics',
      deliveries: 420,
      successRate: '97%'
    },
    {
      distributorName: 'FastTrack Express',
      deliveries: 380,
      successRate: '95%'
    },
    {
      distributorName: 'QuickMove Courier',
      deliveries: 340,
      successRate: '94%'
    }
  ];

  regionalPerformance = [
    {
      region: 'North',
      deliveries: 540,
      successRate: '96%'
    },
    {
      region: 'South',
      deliveries: 430,
      successRate: '94%'
    },
    {
      region: 'West',
      deliveries: 370,
      successRate: '92%'
    }
  ];

  recentActivities = [
    {
      distributor: 'Raj Logistics',
      activity: 'Completed 25 Deliveries',
      date: 'Today'
    },
    {
      distributor: 'FastTrack Express',
      activity: 'Collected ₹18,500 COD',
      date: 'Today'
    },
    {
      distributor: 'QuickMove Courier',
      activity: 'Updated Delivery Status',
      date: 'Yesterday'
    }
  ];

  ngAfterViewInit(): void {

    new Chart('distributorPerformanceChart', {
      type: 'bar',
      data: {
        labels: [
          'Raj Logistics',
          'FastTrack',
          'QuickMove',
          'ExpressGo',
          'BlueShip'
        ],
        datasets: [
          {
            label: 'Deliveries',
            data: [420, 380, 340, 290, 240]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart('regionalChart', {
      type: 'doughnut',
      data: {
        labels: [
          'North',
          'South',
          'West',
          'East'
        ],
        datasets: [
          {
            data: [35, 28, 22, 15]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }
}