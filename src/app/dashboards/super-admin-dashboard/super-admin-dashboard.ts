import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [Sidebar, RouterOutlet],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.css'
})
export class SuperAdminDashboard {

menuItems = [
  { label: 'Dashboard', route: '/super-admin/dashboard', icon: 'fa-chart-pie' },
  {
    label: 'Merchants',
    icon: 'fa-store',
    expanded: false,
    children: [
      { label: 'Merchant List', route: '/super-admin/merchants' },
      { label: 'Create Merchant', route: '/super-admin/merchants/create' }
    ]
  },
  {
    label: 'Merchant Finance',
    icon: 'fa-money-bill-wave',
    expanded: false,
    children: [
      { label: 'Merchant Wallets', route: '/super-admin/merchant-finance/wallets' },
      { label: 'Merchant Transactions', route: '/super-admin/merchant-finance/transactions' }
    ]
  },
  { label: 'Distributors', route: '/super-admin/distributors', icon: 'fa-truck-ramp-box' },
  { label: 'Shipments', route: '/super-admin/shipments', icon: 'fa-box-open' },
  { label: 'Tracking', route: '/super-admin/tracking', icon: 'fa-map-marked-alt' },
  { label: 'Rate Management', route: '/super-admin/rate-management', icon: 'fa-tags' },
  { label: 'Payments', route: '/super-admin/payments', icon: 'fa-wallet' },
  { label: 'Reports', route: '/super-admin/reports', icon: 'fa-chart-line' },
  { label: 'User Management', route: '/super-admin/user-management', icon: 'fa-users-cog' },
  { label: 'Settings', route: '/super-admin/settings', icon: 'fa-cog' }
];

}
