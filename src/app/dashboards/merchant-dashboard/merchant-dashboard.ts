import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
@Component({
  selector: 'app-merchant-dashboard',
  imports: [Sidebar],
  templateUrl: './merchant-dashboard.html',
  styleUrl: './merchant-dashboard.css',
})
export class MerchantDashboard {
  menuItems = [
    'Dashboard',
    'Shipments',
    'Create Shipment',
    'Bulk Upload',
    'Payments',
    'Reports',
    'Address Book',
    'Support',
  ];
}
