import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
@Component({
  selector: 'app-warehouse-dashboard',
  imports: [Sidebar],
  templateUrl: './warehouse-dashboard.html',
  styleUrl: './warehouse-dashboard.css',
})
export class WarehouseDashboard {
  menuItems = [
    'Dashboard',
    'Inbound Shipments',
    'Outbound Shipments',
    'Inventory',
    'Scane & Receive',
    'Scan & Dispatch',
    'Reports',
    'Support'
  ];
}
