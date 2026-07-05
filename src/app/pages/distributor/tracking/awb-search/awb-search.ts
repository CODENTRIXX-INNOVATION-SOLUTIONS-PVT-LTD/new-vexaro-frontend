import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../../services/shipment.service';

interface ShipmentSummary {
  awb: string;
  status: string;
  rawStatus: string;
  customerName: string;
  customerPhone: string;
  destCity: string;
  destPincode: string;
  originCity: string;
  paymentType: string;
  codAmount: number;
  carrier: string;
  weight: number;
  isCOD: boolean;
}

interface TimelineEvent {
  date: string;
  time: string;
  status: string;
  rawStatus: string;
  location: string;
  note: string;
  isCurrent: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED:    'Order Created',
  PICKED_UP:        'Picked Up',
  ARRIVED_AT_HUB:   'Arrived at Hub',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
  DELIVERY_FAILED:  'Delivery Failed',
  RTO:              'RTO',
  CANCELLED:        'Cancelled',
};

@Component({
  selector: 'app-awb-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './awb-search.html',
  styleUrl: './awb-search.css',
})
export class AwbSearch implements OnInit {
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);
  private shipmentService = inject(ShipmentService);

  searchQuery = '';
  isLoading   = false;
  hasSearched = false;
  error       = '';

  shipment: ShipmentSummary | null = null;
  timeline: TimelineEvent[]        = [];

  ngOnInit(): void {
    // Auto-search if AWB passed as query param (e.g. from shipments list)
    this.route.queryParams.subscribe(params => {
      const awb = params['awb'] || '';
      if (awb) {
        this.searchQuery = awb;
        this.search();
      }
    });
  }

  search(): void {
    const q = this.searchQuery.trim();
    if (!q) return;

    this.isLoading   = true;
    this.hasSearched = true;
    this.error       = '';
    this.shipment    = null;
    this.timeline    = [];

    this.shipmentService.trackAWB(q).subscribe({
      next: (res) => {
        const d = res?.data;
        if (!d) {
          this.error     = `No shipment found for "${q}".`;
          this.isLoading = false;
          return;
        }

        this.shipment = {
          awb:          d.awb,
          status:       STATUS_LABELS[d.status] ?? d.status,
          rawStatus:    d.status,
          customerName: d.destination?.name  || '—',
          customerPhone: d.destination?.phone || '—',
          destCity:     d.destination?.city  || '—',
          destPincode:  d.destination?.pincode || '—',
          originCity:   d.origin?.city || '—',
          paymentType:  d.isCOD ? 'COD' : 'Prepaid',
          codAmount:    d.codAmount ?? 0,
          isCOD:        d.isCOD ?? false,
          carrier:      d.carrier ?? '—',
          weight:       d.weight ?? 0,
        };

        // Build timeline from statusHistory (newest first)
        const history: any[] = d.statusHistory ?? [];
        const sorted = [...history].sort(
          (a, b) => new Date(b.updatedAt ?? b.timestamp ?? b.createdAt).getTime()
                  - new Date(a.updatedAt ?? a.timestamp ?? a.createdAt).getTime()
        );

        this.timeline = sorted.map((h: any, i: number) => {
          const dt = new Date(h.updatedAt ?? h.timestamp ?? h.createdAt);
          return {
            date:      dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            time:      dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status:    STATUS_LABELS[h.status] ?? h.status,
            rawStatus: h.status,
            location:  h.location || d.destination?.city || '—',
            note:      h.note || h.description || '',
            isCurrent: i === 0,
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || `Could not find shipment "${q}".`;
        this.isLoading = false;
      },
    });
  }

  viewHistory(): void {
    this.router.navigate(['/distributor/tracking/history'], {
      queryParams: { awb: this.shipment?.awb },
    });
  }
}
