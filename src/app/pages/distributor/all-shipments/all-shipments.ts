import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface Shipment {
  id: string;
  awb: string;
  merchantId: string;
  merchantName: string;
  destPincode: string;
  status: 'Manifested' | 'Received at Hub' | 'Out for Delivery' | 'Delivered' | 'Failed Attempt' | 'RTO';
  paymentType: 'Prepaid' | 'COD';
  codAmount: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-all-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-shipments.html',
  styleUrl: './all-shipments.css'
})
export class AllShipments implements OnInit {
  shipments: Shipment[] = [];
  filteredShipments: Shipment[] = [];
  
  // Filters
  searchTerm: string = '';
  statusFilter: string = 'All';
  merchantFilterId: string = '';
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.merchantFilterId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadShipments();
  }

  loadShipments() {
    this.isLoading = true;
    // TODO: Replace with real API call
    // GET /distributor/:id/shipments
    // If this.merchantFilterId is set, add ?merchantId=...
    this.shipments = [];
    this.isLoading = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredShipments = this.shipments.filter(s => {
      const matchesSearch = s.awb.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            s.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
  
  viewTimeline(awb: string) {
    this.router.navigate(['/distributor/tracking/search'], { queryParams: { awb } });
  }
}
