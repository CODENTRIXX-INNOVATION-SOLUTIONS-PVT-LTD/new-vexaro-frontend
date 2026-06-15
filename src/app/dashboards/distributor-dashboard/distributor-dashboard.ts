import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-distributor-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './distributor-dashboard.html',
  styleUrl: './distributor-dashboard.css',
})
export class DistributorDashboard {
  menuItems = [
    { label: 'Dashboard', route: '/distributor/dashboard' },
    { label: 'Deliveries', route: '/distributor/deliveries' },
    { label: 'Assign Delivery', route: '/distributor/assign-delivery' },
    { label: 'Pickups', route: '/distributor/pickups' },
    { label: 'Shipments', route: '/distributor/shipments' },
    { label: 'Tracking', route: '/distributor/tracking' },
    { label: 'Failed Deliveries', route: '/distributor/failed-deliveries' },
    { label: 'Reports', route: '/distributor/reports' },
    { label: 'Drivers', route: '/distributor/drivers' },
    { label: 'Support', route: '/distributor/support' },
  ];
}
