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
  { label: 'Dashboard', route: '/super-admin/dashboard' },
  { label: 'Merchants', route: '/super-admin/merchants' },
  { label: 'Distributors', route: '/super-admin/distributors' },
  // { label: 'Warehouses', route: '/super-admin/warehouses' },
  // { label: 'Shipments', route: '/super-admin/shipments' },
  // { label: 'Tracking', route: '/super-admin/tracking' },
  // { label: 'Rate Management', route: '/super-admin/rate-management' },
  { label: 'Payments', route: '/super-admin/payments' },
  { label: 'Reports', route: '/super-admin/reports' },
  // { label: 'User & Roles', route: '/super-admin/user-management' },
  { label: 'Settings', route: '/super-admin/settings' }
];

}