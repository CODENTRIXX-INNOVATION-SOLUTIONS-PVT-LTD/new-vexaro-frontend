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
      destination: 'Mumbai',
      status: 'Delivered',
      date: '10 Jun 2026',
      amount: '₹1,250'
    },
    {
      trackingId: 'VX001246',
      customer: 'Priya Singh',
      destination: 'Delhi',
      status: 'In Transit',
      date: '10 Jun 2026',
      amount: '₹890'
    },
    {
      trackingId: 'VX001247',
      customer: 'Amit Verma',
      destination: 'Bhopal',
      status: 'Pending',
      date: '09 Jun 2026',
      amount: '₹640'
    },
    {
      trackingId: 'VX001248',
      customer: 'Neha Gupta',
      destination: 'Pune',
      status: 'Delivered',
      date: '09 Jun 2026',
      amount: '₹1,780'
    },
    {
      trackingId: 'VX001249',
      customer: 'Rohan Patel',
      destination: 'Ahmedabad',
      status: 'In Transit',
      date: '08 Jun 2026',
      amount: '₹1,120'
    }
  ];

}