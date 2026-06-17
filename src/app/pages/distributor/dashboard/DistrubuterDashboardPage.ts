import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';
import { CommonModule } from '@angular/common';
import { FinancialStore } from '../../../shared/financial-store';

@Component({
  selector: 'app-dashboard',
<<<<<<< Updated upstream
  standalone: true,
  imports: [CommonModule, DashboardHeader, DistributorDashboardBottom],
=======
   imports: [DashboardHeader, StatsCards, DeliveryOverview, DeliveryByStatus, DistributorDashboardBottom, CommonModule],
>>>>>>> Stashed changes
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage {
<<<<<<< Updated upstream
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
=======
  requestSent: boolean = false;

  get status() {
    const req = FinancialStore.onboardingRequests.find(r => r.email === 'ketan@gmail.com');
    return req ? req.status : 'Active';
  }

  requestApproval() {
    this.requestSent = true;
    const req = FinancialStore.onboardingRequests.find(r => r.email === 'ketan@gmail.com');
    if (req) {
      alert('Approval request has been sent to the Super Admin!');
    } else {
      FinancialStore.onboardingRequests.unshift({
        requestId: 'ONB' + Math.floor(1000 + Math.random() * 9000),
        distributorName: 'Ketan Logistics Hub',
        email: 'ketan@gmail.com',
        phone: '9876543210',
        region: 'North Zone',
        date: '17 Jun 2026',
        status: 'Pending'
      });
      alert('Approval request has been sent to the Super Admin!');
    }
  }

  cards = [
    {
      title: 'Assigned Deliveries',
      value: '128',
      icon: 'fas fa-box',
>>>>>>> Stashed changes
      iconColor: '#2563eb',
      bgColor: '#dbeafe'
    },
    {
<<<<<<< Updated upstream
      title: 'Active Merchants',
      value: '10',
      icon: 'fas fa-user-check',
=======
      title: 'Delivered Today',
      value: '42',
      icon: 'fas fa-check-circle',
>>>>>>> Stashed changes
      iconColor: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
<<<<<<< Updated upstream
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
=======
      title: 'Pending Deliveries',
      value: '18',
      icon: 'fas fa-clock',
>>>>>>> Stashed changes
      iconColor: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
    }
  ];
}
