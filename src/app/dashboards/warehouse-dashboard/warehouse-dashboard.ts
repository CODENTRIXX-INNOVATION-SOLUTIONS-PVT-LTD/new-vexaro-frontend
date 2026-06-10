import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-warehouse-dashboard',
  imports: [Sidebar,RouterOutlet ],
  templateUrl: './warehouse-dashboard.html',
  styleUrl: './warehouse-dashboard.css',
})
export class WarehouseDashboard {
  menuItems = [
    { label: 'Dashboard', route: '/warehouse/dashboard' },
    { label: 'Inbound Shipments', route: '/warehouse/inbound-shipments' },
    { label: 'Outbound Shipments', route: '/warehouse/outbound-shipments' },
    { label: 'Inventory', route: '/warehouse/inventory' },
    { label: 'Scan & Receive', route: '/warehouse/scan-receive' },
    { label: 'Scan & Dispatch', route: '/warehouse/scan-dispatch' },
    { label: 'Reports', route: '/warehouse/reports' },
    { label: 'Support', route: '/warehouse/support' }
  ];
}
