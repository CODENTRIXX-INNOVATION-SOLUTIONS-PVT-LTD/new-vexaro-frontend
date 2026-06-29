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
    { label: 'Dashboard', route: '/merchant/dashboard', icon: 'fa-chart-pie' },
    { label: 'Shipments', route: '/merchant/shipments', icon: 'fa-box-open' },
    { label: 'Tracking', route: '/merchant/tracking', icon: 'fa-map-marked-alt' },
    { label: 'Bulk Upload', route: '/merchant/bulk-upload', icon: 'fa-file-upload' },
    { label: 'Wallet', route: '/merchant/wallet', icon: 'fa-wallet' },
    { label: 'Reports', route: '/merchant/reports', icon: 'fa-chart-line' },
    { label: 'Disputes', route: '/merchant/disputes', icon: 'fa-gavel' },
    { label: 'Address Book', route: '/merchant/address-book', icon: 'fa-address-book' },
    { label: 'Support', route: '/merchant/support', icon: 'fa-headset' },
    { label: 'Warehouse', route: '/merchant/warehouse', icon: 'fa-warehouse' },
    { label: 'My Profile', route: '/merchant/profile', icon: 'fa-user' }
  ];
}
