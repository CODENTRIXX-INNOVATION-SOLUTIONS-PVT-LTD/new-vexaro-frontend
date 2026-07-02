import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Display-friendly row shape the template already binds to
interface ShipmentRow {
  trackingId: string;
  customer:   string;
  courier:    string;
  status:     string;
  date:       string;
}

// Map raw backend status enum → display label + CSS class key
const STATUS_MAP: Record<string, { label: string; css: string }> = {
  ORDER_CREATED:    { label: 'Pending',           css: 'pending'   },
  PICKED_UP:        { label: 'Picked Up',         css: 'transit'   },
  ARRIVED_AT_HUB:   { label: 'At Hub',            css: 'transit'   },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  css: 'transit'   },
  DELIVERED:        { label: 'Delivered',         css: 'delivered' },
  DELIVERY_FAILED:  { label: 'Failed',            css: 'pending'   },
  RTO:              { label: 'RTO',               css: 'pending'   },
  CANCELLED:        { label: 'Cancelled',         css: 'pending'   },
  // Legacy display strings passed by the merchant dashboard
  'In Transit':     { label: 'In Transit',        css: 'transit'   },
  'Pending':        { label: 'Pending',           css: 'pending'   },
};

function mapApiRow(s: any): ShipmentRow {
  const statusMeta = STATUS_MAP[s.status] ?? { label: s.status, css: 'pending' };
  return {
    trackingId: s.awb ?? '—',
    customer:
      s.destination?.name ||
      s.merchantId?.companyName ||
      `${s.merchantId?.firstName ?? ''} ${s.merchantId?.lastName ?? ''}`.trim() ||
      '—',
    courier: s.carrier ?? s.carrierAWB ?? '—',
    status:  statusMeta.label,
    date: s.createdAt
      ? new Date(s.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })
      : '—',
  };
}

/** Convert a merchant-dashboard style object (id, customerName, …) to ShipmentRow */
function mapLegacyRow(s: any): ShipmentRow {
  const statusMeta = STATUS_MAP[s.status] ?? { label: s.status, css: 'pending' };
  return {
    trackingId: s.id        ?? s.trackingId ?? '—',
    customer:   s.customerName ?? s.customer ?? '—',
    courier:    s.courier   ?? '—',
    status:     statusMeta.label,
    date:       s.date      ?? '—',
  };
}

@Component({
  selector: 'app-recent-shipments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-shipments.html',
  styleUrl: './recent-shipments.css'
})
export class RecentShipments implements OnInit {
  private http = inject(HttpClient);
  private readonly baseUrl =
    (window as any).__env?.apiUrl ?? 'http://localhost:5000/api';

  /**
   * Optional external data (used by the merchant dashboard which manages
   * its own shipments array for print/manifest modals).
   * When provided the component skips the API call entirely.
   */
  @Input() set shipments(value: any[]) {
    if (value && value.length >= 0) {
      this._externalShipments = value;
    }
  }
  private _externalShipments: any[] | null = null;

  rows      = signal<ShipmentRow[]>([]);
  isLoading = signal(true);
  hasError  = signal(false);
  errorMsg  = signal('');

  ngOnInit(): void {
    // If data was passed via @Input, map it and skip the API call
    if (this._externalShipments !== null) {
      this.rows.set(this._externalShipments.slice(0, 5).map(mapLegacyRow));
      this.isLoading.set(false);
      return;
    }

    // Otherwise fetch from the API (super-admin / distributor context)
    this.http.get<any>(
      `${this.baseUrl}/shipments`,
      { params: new HttpParams().set('limit', '5').set('page', '1') }
    ).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.shipments ?? [];
        this.rows.set(raw.map(mapApiRow));
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || `HTTP ${err?.status ?? 'unknown'}`;
        console.error('[RecentShipments] API error:', err?.status, err?.error);
        this.errorMsg.set(msg);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /** CSS class for the status badge */
  statusClass(label: string): string {
    const entry = Object.values(STATUS_MAP).find(m => m.label === label);
    return entry?.css ?? 'pending';
  }
}
