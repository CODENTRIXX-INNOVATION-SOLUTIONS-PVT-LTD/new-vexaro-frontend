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
    // { label: 'Tracking', route: '/merchant/tracking' },
    // { label: 'Bulk Upload', route: '/merchant/bulk-upload' },
    { label: 'Wallet', route: '/merchant/payments' },
    { label: 'Reports', route: '/merchant/reports' },
    // { label: 'Address Book', route: '/merchant/address-book' },
    { label: 'Support', route: '/merchant/support' },
    { label: 'Warehouse', route: '/merchant/warehouse' },
    { label: 'My Profile', route: '/merchant/profile' }
  ];
}
