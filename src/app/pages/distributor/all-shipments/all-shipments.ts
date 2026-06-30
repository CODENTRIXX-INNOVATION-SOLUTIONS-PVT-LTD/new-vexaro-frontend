import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CsvExportService } from '../../../shared/csv-export.service';

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
    this.shipments = [
      { id: '1', awb: 'AWB990123', merchantId: 'M1', merchantName: 'ABC Electronics', destPincode: '110001', status: 'Delivered', paymentType: 'Prepaid', codAmount: 0, lastUpdated: '17 Jun 2026' },
      { id: '2', awb: 'AWB889012', merchantId: 'M2', merchantName: 'Global Traders', destPincode: '560001', status: 'Out for Delivery', paymentType: 'COD', codAmount: 2500, lastUpdated: '17 Jun 2026' },
      { id: '3', awb: 'AWB779234', merchantId: 'M1', merchantName: 'ABC Electronics', destPincode: '400001', status: 'Received at Hub', paymentType: 'Prepaid', codAmount: 0, lastUpdated: '16 Jun 2026' },
      { id: '4', awb: 'AWB661122', merchantId: 'M3', merchantName: 'Prime Retail', destPincode: '700001', status: 'Manifested', paymentType: 'COD', codAmount: 1800, lastUpdated: '15 Jun 2026' },
      { id: '5', awb: 'AWB554321', merchantId: 'M2', merchantName: 'Global Traders', destPincode: '110015', status: 'Failed Attempt', paymentType: 'COD', codAmount: 320, lastUpdated: '14 Jun 2026' },
      { id: '6', awb: 'AWB443210', merchantId: 'M4', merchantName: 'Mega Store', destPincode: '560102', status: 'RTO', paymentType: 'Prepaid', codAmount: 0, lastUpdated: '13 Jun 2026' },
    ];
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
