import { Component } from '@angular/core';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ChartSection } from '../../../charts/chart-section/chart-section';
import { RevenueChart } from '../../../charts/revenue-chart/revenue-chart';
import { ShipmentOverview } from '../../../components/shipment-overview/shipment-overview';
import { TopDestinations } from '../../../components/top-destinations/top-destinations';
@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeader, StatsCards, RecentShipments,  ShipmentOverview, TopDestinations],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class MarchandeDashboardPage {
  cards = [
    {
      title: 'Total Shipments',
      value: '12,678',
      icon: 'fas fa-box',
      iconColor: '#2563eb',
      bgColor: '#dbeafe'
    },
    {
      title: 'Delivered',
      value: '10,426',
      icon: 'fas fa-check-circle',
      iconColor: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
      title: 'In Transit',
      value: '1,890',
      icon: 'fas fa-truck',
      iconColor: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Pending',
      value: '362',
      icon: 'fas fa-clock',
      iconColor: '#dc2626',
      bgColor: '#fee2e2'
    },
    {
      title: 'Total Revenue',
      value: '₹45,67,890',
      icon: 'fas fa-indian-rupee-sign',
      iconColor: '#7c3aed',
      bgColor: '#ede9fe'
    }
  ];
}
