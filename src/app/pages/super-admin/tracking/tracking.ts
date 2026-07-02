import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShipmentService } from '../../../services/shipment.service';

export interface ShipmentSummary {
  awb: string;
  status: string;
  customerName: string;
  pincode: string;
  paymentType: string;
  amount: number;
  merchantName: string;
  distributorName: string;
  warehouseName: string;
  carrier: string;
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
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css'
})
export class Tracking {
  private shipmentService = inject(ShipmentService);
  private cdr = inject(ChangeDetectorRef);
  
  searchQuery: string = '';
  hasSearched: boolean = false;
  isLoading: boolean = false;
  error: string = '';
  
  // Filters
  distributorFilter: string = 'All Distributors';
  dateFilter: string = 'Any Date';
  statusFilter: string = 'All Statuses';
  carrierFilter: string = 'All Carriers';

  shipment: ShipmentSummary | null = null;
  timeline: TrackingEvent[] = [];

  constructor(private router: Router) {}

  search() {
    if (!this.searchQuery.trim()) return;
    this.hasSearched = true;
    this.isLoading = true;
    this.error = '';
    this.shipment = null;
    this.timeline = [];

    console.log('Tracking AWB:', this.searchQuery.trim());

    this.shipmentService.trackAWB(this.searchQuery.trim()).subscribe({
      next: (response) => {
        console.log('Tracking response:', response);
        if (response.success && response.data) {
          const data = response.data;
          
          // Map shipment summary
          this.shipment = {
            awb: data.awb || this.searchQuery,
            status: this.mapStatus(data.status),
            customerName: data.destination?.name || 'Unknown',
            pincode: data.destination?.pincode || 'N/A',
            paymentType: data.isCOD ? 'COD' : 'Prepaid',
            amount: data.codAmount || 0,
            merchantName: data.merchantId?.companyName || data.merchantId?.firstName || 'Unknown',
            distributorName: data.distributorId?.companyName || 'N/A',
            warehouseName: data.origin?.name || 'N/A',
            carrier: data.carrier || 'N/A'
          };

          // Map timeline from statusHistory
          this.timeline = (data.statusHistory || []).map((event: any, index: number) => ({
            date: new Date(event.timestamp || event.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(event.timestamp || event.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: this.mapStatus(event.status),
            location: event.location || data.destination?.city || 'Unknown',
            description: event.note || `Status changed to ${this.mapStatus(event.status)}`,
            isCurrent: index === 0
          })).reverse();

          console.log('Mapped shipment:', this.shipment);
          console.log('Mapped timeline:', this.timeline);
        } else {
          this.error = 'Shipment not found';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Tracking error:', err);
        this.error = `Failed to track shipment: ${err.message || err.status || 'Unknown error'}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ORDER_CREATED': 'Order Created',
      'PICKED_UP': 'Picked Up',
      'ARRIVED_AT_HUB': 'At Hub',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'DELIVERY_FAILED': 'Delivery Failed',
      'RTO': 'RTO',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  intervene() {
    alert(`Escalation ticket created for AWB ${this.shipment?.awb}. Operations team notified.`);
  }

  viewLive() {
    alert('Global Live Tracking View (Mock)');
  }

  viewHistory() {
    alert('Global Full Event Log View (Mock)');
  }
}
