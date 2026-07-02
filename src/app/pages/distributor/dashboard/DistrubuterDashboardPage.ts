import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';
import { FinancialStore } from '../../../shared/financial-store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardHeader, DistributorDashboardBottom, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage {
  user = {
    name: 'Rohan Sharma',
    email: 'rohan@example.com',
    profileImage: 'assets/images/default-avatar.png'
  };

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
      iconColor: 'rgb(11, 74, 111)',
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
      iconColor: 'rgb(232, 116, 58)',
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
  ]
}