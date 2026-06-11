import { Component } from '@angular/core';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ChartSection } from '../../../charts/chart-section/chart-section';
import { RevenueChart } from '../../../charts/revenue-chart/revenue-chart';
@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeader, StatsCards, RecentShipments, ChartSection, RevenueChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

 cards = [
  {
    title: 'Total Shipments',
    value: '12,678',
    symbol: '+',
    percentage: '12.5',
    compairTo: 'vs last month',
    icon: 'fas fa-box',
    iconColor: '#2563eb',
    bgColor: '#dbeafe'
  },
  {
    title: 'Delivered',
    value: '10,426',
    symbol: '+',
    percentage: '10.3',
    compairTo: 'vs last month',
    icon: 'fas fa-check-circle',
    iconColor: '#16a34a',
    bgColor: '#dcfce7'
  },
  {
    title: 'In Transit',
    value: '1,890',
    symbol: '+',
    percentage: '8.2',
    compairTo: 'vs last month',
    icon: 'fas fa-truck',
    iconColor: '#f59e0b',
    bgColor: '#fef3c7'
  },
  {
    title: 'Pending',
    value: '362',
    symbol: '-',
    percentage: '4.5',
    compairTo: 'vs last month',
    icon: 'fas fa-clock',
    iconColor: '#dc2626',
    bgColor: '#fee2e2'
  },
  {
    title: 'Total Revenue',
    value: '₹45,67,890',
    symbol: '+',
    percentage: '15.6',
    compairTo: 'vs last month',
    icon: 'fas fa-indian-rupee-sign',
    iconColor: '#7c3aed',
    bgColor: '#ede9fe'
  }
];

}
