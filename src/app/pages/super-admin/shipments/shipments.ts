import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentService, ShipmentListItem } from '../../../services/shipment.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css',
})
export class Shipments implements OnInit {
  private shipmentService = inject(ShipmentService);
  private cdr = inject(ChangeDetectorRef);

  shipments: any[] = [];
  loading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  filterStatus: string = 'All';
  page = 1;
  readonly limit = 20;
  total = 0;

  get totalPages(): number { return Math.ceil(this.total / this.limit) || 1; }

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.loading = true;
    this.error = '';
    
    const token = localStorage.getItem('accessToken');
    console.log('Token exists:', !!token);
    console.log('Token:', token?.substring(0, 20) + '...');
    
    this.shipmentService.listShipments({ page: this.page, limit: this.limit }).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success && response.data?.shipments) {
          this.total = response.meta?.total ?? response.data.shipments.length;
          this.shipments = response.data.shipments.map((s: any) => ({
            awb: s.awb,
            merchant: s.merchantId?.companyName || s.merchantId?.firstName || 'Unknown',
            distributor: s.distributorId?.companyName || 'N/A',
            carrier: s.carrier || 'N/A',
            weight: `${s.weight} kg`,
            status: this.mapStatus(s.status),
            date: new Date(s.createdAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          }));
          console.log('Mapped shipments:', this.shipments);
        } else {
          this.error = 'No shipments data in response';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading shipments:', err);
        this.error = `Failed to load shipments: ${err.message || err.status || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ORDER_CREATED': 'Pending',
      'PICKED_UP': 'In Transit',
      'ARRIVED_AT_HUB': 'In Transit',
      'OUT_FOR_DELIVERY': 'In Transit',
      'DELIVERED': 'Delivered',
      'RTO': 'Failed',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  get filteredShipments() {
    return this.shipments.filter(s => {
      const matchesSearch = s.awb.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            s.merchant.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.filterStatus === 'All' || s.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.loadShipments();
  }

  cancelShipment(shipment: any) {
    if (confirm(`Are you sure you want to intervene and cancel shipment ${shipment.awb}? This will trigger automated wholesale margin reversals back to the Distributor.`)) {
      shipment.status = 'Cancelled';
      alert(`Shipment ${shipment.awb} cancelled successfully. Reversal initiated.`);
    }
  }
}
