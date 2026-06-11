import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-distributor-dashboard-bottom',
  imports: [CommonModule],
  templateUrl: './distributor-dashboard-bottom.html',
  styleUrl: './distributor-dashboard-bottom.css',
})
export class DistributorDashboardBottom {

  deliveries = [
    {
      trackingId: 'AWB123456',
      merchant: 'Fashion Hub',
      customer: 'Rahul Sharma',
      area: 'Bhopal',
      status: 'Delivered'
    },
    {
      trackingId: 'AWB123457',
      merchant: 'Tech Store',
      customer: 'Amit Patel',
      area: 'Indore',
      status: 'Out for Delivery'
    },
    {
      trackingId: 'AWB123458',
      merchant: 'Grocery Mart',
      customer: 'Priya Singh',
      area: 'Pune',
      status: 'Pending'
    }
  ];

  summary = {
    totalShipments: 245,
    deliveredToday: 56,
    pending: 24,
    failed: 5,
    codCollected: 28650
  };

}