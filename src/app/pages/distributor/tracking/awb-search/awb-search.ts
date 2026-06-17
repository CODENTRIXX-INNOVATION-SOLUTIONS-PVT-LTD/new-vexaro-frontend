import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface ShipmentSummary {
  awb: string;
  status: string;
  customerName: string;
  pincode: string;
  paymentType: string;
  amount: number;
}

export interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-awb-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './awb-search.html',
  styleUrl: './awb-search.css'
})
export class AwbSearch {
  searchQuery: string = '';
  hasSearched: boolean = false;
  
  shipment: ShipmentSummary | null = null;
  timeline: TrackingEvent[] = [];

  constructor(private router: Router) {}

  search() {
    if (!this.searchQuery.trim()) return;
    this.hasSearched = true;

    if (this.searchQuery.toUpperCase() === 'NOTFOUND') {
      this.shipment = null;
      this.timeline = [];
      return;
    }

    this.shipment = {
      awb: this.searchQuery.toUpperCase(),
      status: 'Out for Delivery',
      customerName: 'Rahul Sharma',
      pincode: '400050',
      paymentType: 'COD',
      amount: 1500
    };

    this.timeline = [
      { date: '16 Jun 2026', time: '08:30 AM', status: 'Out for Delivery', location: 'Bandra West Hub', description: 'Shipment dispatched with driver Ramesh Singh.', isCurrent: true },
      { date: '16 Jun 2026', time: '06:00 AM', status: 'Sorted', location: 'Bandra West Hub', description: 'Shipment sorted and allocated to Route 4.', isCurrent: false },
      { date: '15 Jun 2026', time: '09:45 PM', status: 'Received at Hub', location: 'Bandra West Hub', description: 'Inbound scan completed.', isCurrent: false },
      { date: '15 Jun 2026', time: '04:15 PM', status: 'Picked Up', location: 'Andheri East', description: 'Driver Amit picked up the package.', isCurrent: false },
      { date: '15 Jun 2026', time: '10:00 AM', status: 'Manifested', location: 'Andheri East', description: 'Merchant generated AWB.', isCurrent: false }
    ];
  }

  viewLive() {
    this.router.navigate(['/distributor/tracking/live'], { queryParams: { awb: this.shipment?.awb }});
  }

  viewHistory() {
    this.router.navigate(['/distributor/tracking/history'], { queryParams: { awb: this.shipment?.awb }});
  }
}
