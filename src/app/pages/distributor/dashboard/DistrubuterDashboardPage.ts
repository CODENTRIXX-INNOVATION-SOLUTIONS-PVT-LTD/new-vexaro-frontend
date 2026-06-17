import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeader, DistributorDashboardBottom],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage {
  user = {
    name: 'Rohan Sharma',
    email: 'rohan@example.com',
    profileImage: 'assets/images/default-avatar.png'
  };
  cards = [
    {
      title: 'Total Merchants',
      value: '12',
      icon: 'fas fa-users',
      iconColor: '#2563eb',
      bgColor: '#dbeafe'
    },
    {
      title: 'Active Merchants',
      value: '10',
      icon: 'fas fa-user-check',
      iconColor: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
      title: 'Wallet Balance',
      value: '₹8,50,000',
      icon: 'fas fa-wallet',
      iconColor: '#7c3aed',
      bgColor: '#ede9fe'
    },
    {
      title: "Today's Bookings",
      value: '48',
      icon: 'fas fa-box',
      iconColor: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Monthly Profit',
      value: '₹45,000',
      icon: 'fas fa-chart-line',
      iconColor: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Weight Disputes',
      value: '3',
      icon: 'fas fa-balance-scale',
      iconColor: '#dc2626',
      bgColor: '#fee2e2'
    }
  ];
}
