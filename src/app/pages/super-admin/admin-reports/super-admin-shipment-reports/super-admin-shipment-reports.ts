import { Component } from '@angular/core';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-super-admin-shipment-reports',
  imports: [StatsCards],
  templateUrl: './super-admin-shipment-reports.html',
  styleUrl: './super-admin-shipment-reports.css',
})
export class SuperAdminShipmentReports {
   ngAfterViewInit(): void {

    new Chart('shipmentTrendChart', {
      type: 'line',
      data: {
        labels: [
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
          'Sun'
        ],
        datasets: [
          {
            label: 'Shipments',
            data: [120, 180, 160, 240, 210, 280, 300],
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart('shipmentStatusChart', {
      type: 'doughnut',
      data: {
        labels: [
          'Delivered',
          'Pending',
          'Failed',
          'Returned'
        ],
        datasets: [
          {
            data: [980, 180, 45, 45],
            backgroundColor: [
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#9333ea'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }

shipmentCards = [
  {
    title: 'Total Shipments',
    value: 1250,
    icon: 'fas fa-box',
    bgColor: '#DBEAFE',
    iconColor: '#2563EB',

  },
  {
    title: 'Delivered',
    value: 980,
    icon: 'fas fa-check-circle',
    bgColor: '#DCFCE7',
    iconColor: '#16A34A'
  },
  {
    title: 'Pending',
    value: 180,
    icon: 'fas fa-clock',
    bgColor: '#FEF3C7',
    iconColor: '#D97706'
  },
  {
    title: 'Failed',
    value: 45,
    icon: 'fas fa-times-circle',
    bgColor: '#FEE2E2',
    iconColor: '#DC2626'
  },
  {
    title: 'Returned',
    value: 45,
    icon: 'fas fa-undo',
    bgColor: '#F3E8FF',
    iconColor: '#9333EA'
  }
];
}
