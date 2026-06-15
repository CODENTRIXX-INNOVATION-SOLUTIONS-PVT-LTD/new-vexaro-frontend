import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-distributor-shipments',
  imports: [CommonModule],
  templateUrl: './distributor-shipments.html',
  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorShipments {
  shipments = [
  {
    shipmentId: 'SHP1001',
    destination: 'Mumbai',
    date: '2026-06-12',
    amount: 12500,
    status: 'Delivered'
  },
  {
    shipmentId: 'SHP1002',
    destination: 'Pune',
    date: '2026-06-13',
    amount: 8900,
    status: 'In Transit'
  },
  {
    shipmentId: 'SHP1003',
    destination: 'Nagpur',
    date: '2026-06-14',
    amount: 15200,
    status: 'Pending'
  }
];

}
