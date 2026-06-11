import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-shipments',
  standalone: true,
  templateUrl: './recent-shipments.html',
  styleUrl: './recent-shipments.css'
})
export class RecentShipments {

shipments = [
  {
    trackingId: 'VX001245',
    customer: 'Rahul Sharma',
    courier: 'Blue Dart',
    status: 'Delivered',
    date: '10 Jun 2026'
  },
  {
    trackingId: 'VX001246',
    customer: 'Priya Singh',
    courier: 'Delhivery',
    status: 'In Transit',
    date: '10 Jun 2026'
  },
  {
    trackingId: 'VX001247',
    customer: 'Amit Verma',
    courier: 'Ecom Express',
    status: 'Pending',
    date: '09 Jun 2026'
  },
  {
    trackingId: 'VX001248',
    customer: 'Neha Gupta',
    courier: 'DTDC',
    status: 'Delivered',
    date: '09 Jun 2026'
  },
  {
    trackingId: 'VX001249',
    customer: 'Rohan Patel',
    courier: 'XpressBees',
    status: 'In Transit',
    date: '08 Jun 2026'
  }
];
}