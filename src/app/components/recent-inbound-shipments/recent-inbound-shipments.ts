import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-inbound-shipments',
  imports: [],
  templateUrl: './recent-inbound-shipments.html',
  styleUrl: './recent-inbound-shipments.css',
})
export class RecentInboundShipments {
  shipments = [
    {
      trackingId: 'VX001245',
      customer: 'Rahul Sharma',
      destination: 'Mumbai',
      status: 'Delivered',
      date: '10 Jun 2026',
      items: '10'
    },
    {
      trackingId: 'VX001246',
      customer: 'Priya Singh',
      destination: 'Delhi',
      status: 'In Transit',
      date: '10 Jun 2026',
      items: '1'
    },
    {
      trackingId: 'VX001247',
      customer: 'Amit Verma',
      destination: 'Bhopal',
      status: 'Pending',
      date: '09 Jun 2026',
     items: '9'
    },
    {
      trackingId: 'VX001248',
      customer: 'Neha Gupta',
      destination: 'Pune',
      status: 'Delivered',
      date: '09 Jun 2026',
      items: '14'
    },
    {
      trackingId: 'VX001249',
      customer: 'Rohan Patel',
      destination: 'Ahmedabad',
      status: 'In Transit',
      date: '08 Jun 2026',
     items: '17'
    }
  ];
}
