import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShipmentService } from '../../../../services/shipment.service';

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
  isLoading: boolean = false;
  
  shipment: ShipmentSummary | null = null;
  timeline: TrackingEvent[] = [];

  constructor(private router: Router, private shipmentService: ShipmentService) {}

  search() {
    if (!this.searchQuery.trim()) return;
    this.hasSearched = true;
    this.isLoading = true;

    this.shipmentService.trackAWB(this.searchQuery.trim()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.shipment = {
            awb: data.awb || this.searchQuery.toUpperCase(),
            status: data.status || 'Unknown',
            customerName: data.customerName || 'N/A',
            pincode: data.pincode || 'N/A',
            paymentType: data.paymentType || 'N/A',
            amount: data.amount || 0
          };
          this.timeline = (data.timeline || []).map((event: any) => ({
            date: event.date || '',
            time: event.time || '',
            status: event.status || '',
            location: event.location || '',
            description: event.description || '',
            isCurrent: event.isCurrent || false
          }));
        } else {
          this.shipment = null;
          this.timeline = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error tracking AWB:', error);
        this.shipment = null;
        this.timeline = [];
        this.isLoading = false;
      }
    });
  }

  viewLive() {
    this.router.navigate(['/distributor/tracking/live'], { queryParams: { awb: this.shipment?.awb }});
  }

  viewHistory() {
    this.router.navigate(['/distributor/tracking/history'], { queryParams: { awb: this.shipment?.awb }});
  }
}
