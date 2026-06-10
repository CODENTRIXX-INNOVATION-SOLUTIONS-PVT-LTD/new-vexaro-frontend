import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-merchant-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './merchant-dashboard.html',
  styleUrl: './merchant-dashboard.css',
})
export class MerchantDashboard {
  menuItems = [
  { label: 'Dashboard', route: '/merchant/dashboard' },
  { label: 'Shipments', route: '/merchant/shipments' },
  { label: 'Create Shipment', route: '/merchant/create-shipment' },
  { label: 'Bulk Upload', route: '/merchant/bulk-upload' },
  { label: 'Payments', route: '/merchant/payments' },
  { label: 'Reports', route: '/merchant/reports' },
  { label: 'Address Book', route: '/merchant/address-book' },
  { label: 'Support', route: '/merchant/support' }
];
}
