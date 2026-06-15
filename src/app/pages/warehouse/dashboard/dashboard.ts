import { Component } from '@angular/core';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { ChartSection } from '../../../charts/chart-section/chart-section';
import { WarehouseChartSectionimplements } from '../../../charts/warehouse-chart-section/warehouse-chart-section';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { RecentInboundShipments } from '../../../components/recent-inbound-shipments/recent-inbound-shipments';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeader, StatsCards,  WarehouseChartSectionimplements, RecentInboundShipments],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class WarehouseDashboardPage {
  cards = [
    {
      title: 'Inbound',
      value: '12,678',
      icon: 'fas fa-arrow-down',
      iconColor: '#2563eb',
      bgColor: '#dbeafe'
    },
    {
      title: 'Outbound',
      value: '10,426',
      icon: 'fas fa-arrow-up',
      iconColor: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
      title: 'In Stock',
      value: '1,890',
      icon: 'fas fa-warehouse',
      iconColor: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Pending Dispatch',
      value: '362',
      icon: 'fas fa-truck-loading',
      iconColor: '#7c3aed',
      bgColor: '#ede9fe'
    },
    {
      title: 'Damaged Items',
      value: '45',
      icon: 'fas fa-exclamation-triangle',
      iconColor: '#dc2626',
      bgColor: '#fee2e2'
    }
  ];
}
