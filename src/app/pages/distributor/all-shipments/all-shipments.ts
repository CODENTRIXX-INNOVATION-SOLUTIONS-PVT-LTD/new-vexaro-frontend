import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CsvExportService } from '../../../shared/csv-export.service';
import { ShipmentService } from '../../../services/shipment.service';

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

  private csvService = inject(CsvExportService);

  constructor(private route: ActivatedRoute, private router: Router, private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.merchantFilterId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadShipments();
  }

  loadShipments() {
    this.isLoading = true;
    const params: any = {};
    if (this.merchantFilterId) params.merchantId = this.merchantFilterId;
    
    this.shipmentService.listShipments(params).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.shipments) {
          this.shipments = response.data.shipments.map((s: any) => ({
            id: s.id,
            awb: s.awb,
            merchantId: s.merchantId,
            merchantName: s.merchantName || 'N/A',
            destPincode: s.destination?.pincode || s.destPincode || 'N/A',
            status: s.status,
            paymentType: s.isCOD ? 'COD' : 'Prepaid',
            codAmount: s.codAmount || 0,
            lastUpdated: s.updatedAt || s.lastUpdated || 'N/A'
          }));
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading shipments:', error);
        this.isLoading = false;
      }
    });
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

  exportCSV() {
    const headers = ['AWB', 'Merchant', 'Dest. Pincode', 'Status', 'Payment Type', 'COD Amount', 'Last Updated'];
    const rows = this.filteredShipments.map(s => [
      s.awb,
      s.merchantName,
      s.destPincode,
      s.status,
      s.paymentType,
      s.codAmount,
      s.lastUpdated
    ]);
    this.csvService.export('shipments_export', headers, rows);
  }
}
