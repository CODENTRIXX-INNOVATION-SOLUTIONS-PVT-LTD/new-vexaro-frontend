import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';
import { FinancialStore } from '../../../shared/financial-store';
import { ShipmentService } from '../../../services/shipment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardHeader, DistributorDashboardBottom, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage implements OnInit {
  user = {
    name: 'Rohan Sharma',
    email: 'rohan@example.com',
    profileImage: 'assets/images/default-avatar.png'
  };

  requestSent: boolean = false;
  isLoading: boolean = false;
  cards: any[] = [];

  constructor(
    private shipmentService: ShipmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getMe().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = {
            name: response.data.name || this.user.name,
            email: response.data.email || this.user.email,
            profileImage: response.data.profileImage || this.user.profileImage
          };
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.shipmentService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;
          this.cards = [
            {
              title: 'Assigned Deliveries',
              value: stats.assignedDeliveries || '0',
              icon: 'fas fa-box',
              iconColor: 'rgb(11, 74, 111)',
              bgColor: '#dbeafe'
            },
            {
              title: 'Active Merchants',
              value: stats.activeMerchants || '0',
              icon: 'fas fa-user-check',
              iconColor: '#16a34a',
              bgColor: '#dcfce7'
            },
            {
              title: 'Wallet Balance',
              value: stats.walletBalance ? `₹${stats.walletBalance.toLocaleString()}` : '₹0',
              icon: 'fas fa-wallet',
              iconColor: '#7c3aed',
              bgColor: '#ede9fe'
            },
            {
              title: "Today's Bookings",
              value: stats.todayBookings || '0',
              icon: 'fas fa-box',
              iconColor: 'rgb(232, 116, 58)',
              bgColor: '#fef3c7'
            },
            {
              title: 'Monthly Profit',
              value: stats.monthlyProfit ? `₹${stats.monthlyProfit.toLocaleString()}` : '₹0',
              icon: 'fas fa-chart-line',
              iconColor: '#10b981',
              bgColor: '#d1fae5'
            },
            {
              title: 'Weight Disputes',
              value: stats.weightDisputes || '0',
              icon: 'fas fa-balance-scale',
              iconColor: '#dc2626',
              bgColor: '#fee2e2'
            }
          ];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });
  }

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
}