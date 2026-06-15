import { Component } from '@angular/core';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { DeliveryOverview } from '../../../charts/delivery-overview/delivery-overview';
import { DeliveryByStatus } from '../../../charts/delivery-by-status/delivery-by-status';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';

@Component({
  selector: 'app-dashboard',
   imports: [DashboardHeader, StatsCards, DeliveryOverview, DeliveryByStatus, DistributorDashboardBottom],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage {
cards = [
  {
    title: 'Assigned Deliveries',
    value: '128',
    icon: 'fas fa-box',
    iconColor: '#2563eb',
    bgColor: '#dbeafe'
  },
  {
    title: 'Delivered Today',
    value: '42',
    icon: 'fas fa-check-circle',
    iconColor: '#16a34a',
    bgColor: '#dcfce7'
  },
  {
    title: 'Pending Deliveries',
    value: '18',
    icon: 'fas fa-clock',
    iconColor: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    title: 'Failed Deliveries',
    value: '5',
    icon: 'fas fa-times-circle',
    iconColor: '#dc2626',
    bgColor: '#fee2e2'
  },
  {
    title: 'COD to Collect',
    value: '₹12,450',
    icon: 'fas fa-money-bill-wave',
    iconColor: '#7c3aed',
    bgColor: '#ede9fe'
  }
];
}
