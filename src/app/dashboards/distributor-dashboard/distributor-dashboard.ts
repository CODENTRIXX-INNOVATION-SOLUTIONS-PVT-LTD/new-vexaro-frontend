import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-distributor-dashboard',
  imports: [Sidebar],
  templateUrl: './distributor-dashboard.html',
  styleUrl: './distributor-dashboard.css',
})
export class DistributorDashboard {
  menuItems = [
    'Dashboard',
    'Deliveries',
    'Assign Delivery',
    'Pickups',
    'Failed Deliveries',
    'Reports',
    'Drivers',
    'Support',
  ];
}
