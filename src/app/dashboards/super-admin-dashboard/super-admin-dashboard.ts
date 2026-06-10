import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.css'
})
export class SuperAdminDashboard {

  menuItems = [
    'Dashboard',
    'Merchants',
    'Distributors',
    'Warehouses',
    'Shipments',
    'Tracking',
    'Rate Management',
    'Payments',
    'Reports',
    'User Management',
    'Settings'
  ];

}