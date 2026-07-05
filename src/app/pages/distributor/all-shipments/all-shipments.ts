import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../services/shipment.service';
import { CsvExportService } from '../../../shared/csv-export.service';

interface ShipmentRow {
  id: string;
  awb: string;
  merchantName: string;
  dest: string;
  destPincode: string;
  status: string;
  rawStatus: string;
  paymentType: 'Prepaid' | 'COD';
  codAmount: number;
  weight: number;
  amount: number;
  carrier: string;
  date: string;
}

const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED:    'Pending',
  PICKED_UP:        'Picked Up',
  ARRIVED_AT_HUB:   'At Hub',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  DELIVERY_FAILED:  'Failed',
  RTO:              'RTO',
  CANCELLED:        'Cancelled',
};

@Component({
  selector: 'app-all-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-shipments.html',
  styleUrl: './all-shipments.css',
})
export class AllShipments implements OnInit {
  private shipmentService = inject(ShipmentService);
  private csvService      = inject(CsvExportService);
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);

  shipments: ShipmentRow[] = [];
  isLoading  = false;
  error      = '';

  // Filters
  searchTerm    = '';
  statusFilter  = '';
  merchantFilterId = '';   // pre-filled when coming from a merchant profile

  // Pagination
  page        = 1;
  readonly limit = 20;
  total       = 0;

  get totalPages(): number { return Math.ceil(this.total / this.limit) || 1; }

  get filteredShipments(): ShipmentRow[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.shipments.filter(s =>
      (!q || s.awb.toLowerCase().includes(q) || s.merchantName.toLowerCase().includes(q))
    );
  }

  ngOnInit(): void {
    this.merchantFilterId = this.route.snapshot.queryParams['merchantId'] || '';
    this.loadShipments();
  }

  loadShipments(): void {
    this.isLoading = true;
    this.error     = '';

    const params: any = { page: this.page, limit: this.limit };
    if (this.statusFilter)    params.status   = this.statusFilter;
    if (this.merchantFilterId) params.merchant = this.merchantFilterId;

    this.shipmentService.listShipments(params).subscribe({
      next: (res) => {
        this.total = res?.meta?.total ?? 0;
        this.shipments = (res?.data?.shipments ?? []).map((s: any): ShipmentRow => ({
          id:          s._id,
          awb:         s.awb,
          merchantName: s.merchantId?.companyName ?? s.merchantId?.firstName ?? '—',
          dest:        `${s.destination?.city ?? '—'}, ${s.destination?.state ?? ''}`.replace(/,\s*$/, ''),
          destPincode: s.destination?.pincode ?? '—',
          status:      STATUS_LABELS[s.status] ?? s.status,
          rawStatus:   s.status,
          paymentType: s.isCOD ? 'COD' : 'Prepaid',
          codAmount:   s.codAmount ?? 0,
          weight:      s.weight ?? 0,
          amount:      s.merchantCost ?? 0,
          carrier:     s.carrier ?? '—',
          date:        new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load shipments.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadShipments();
  }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.loadShipments(); }
  }

  nextPage(): void {
    if (this.page < this.totalPages) { this.page++; this.loadShipments(); }
  }

  viewTimeline(awb: string): void {
    this.router.navigate(['/distributor/tracking/search'], { queryParams: { awb } });
  }

  exportCSV(): void {
    const headers = ['AWB', 'Merchant', 'Destination', 'Pincode', 'Status', 'Payment', 'COD Amount', 'Weight (kg)', 'Charge', 'Carrier', 'Date'];
    const rows = this.filteredShipments.map(s => [
      s.awb, s.merchantName, s.dest, s.destPincode,
      s.status, s.paymentType, s.codAmount,
      s.weight, s.amount, s.carrier, s.date,
    ]);
    this.csvService.export('distributor_shipments', headers, rows);
  }
}
