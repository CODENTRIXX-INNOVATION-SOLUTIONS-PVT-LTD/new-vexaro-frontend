import { Component, Input, OnInit, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface ShipmentRow {
  trackingId: string;
  customer:   string;
  courier:    string;
  status:     string;
  date:       string;
}

const STATUS_MAP: Record<string, { label: string; css: string }> = {
  ORDER_CREATED:    { label: 'Pending',          css: 'pending'   },
  PICKED_UP:        { label: 'Picked Up',        css: 'transit'   },
  ARRIVED_AT_HUB:   { label: 'At Hub',           css: 'transit'   },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', css: 'transit'   },
  DELIVERED:        { label: 'Delivered',        css: 'delivered' },
  DELIVERY_FAILED:  { label: 'Failed',           css: 'pending'   },
  RTO:              { label: 'RTO',              css: 'pending'   },
  CANCELLED:        { label: 'Cancelled',        css: 'pending'   },
  'In Transit':     { label: 'In Transit',       css: 'transit'   },
  'Pending':        { label: 'Pending',          css: 'pending'   },
};

function mapApiRow(s: any): ShipmentRow {
  const m = STATUS_MAP[s.status] ?? { label: s.status, css: 'pending' };
  return {
    trackingId: s.awb ?? '—',
    customer:
      s.destination?.name ||
      s.merchantId?.companyName ||
      `${s.merchantId?.firstName ?? ''} ${s.merchantId?.lastName ?? ''}`.trim() || '—',
    courier: s.carrier ?? s.carrierAWB ?? '—',
    status:  m.label,
    date: s.createdAt
      ? new Date(s.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—',
  };
}

function mapLegacyRow(s: any): ShipmentRow {
  const m = STATUS_MAP[s.status] ?? { label: s.status, css: 'pending' };
  return {
    trackingId: s.id ?? s.awb ?? s.trackingId ?? '—',
    customer:   s.customerName ?? s.customer ?? '—',
    courier:    s.courier ?? '—',
    status:     m.label,
    date:       s.date ?? '—',
  };
}

/** Derive "View All" route from the stored userRole */
function viewAllRoute(): string {
  const role = localStorage.getItem('userRole') ?? sessionStorage.getItem('userRole') ?? '';
  switch (role) {
    case 'MERCHANT':    return '/merchant/shipments';
    case 'DISTRIBUTOR': return '/distributor/operations/shipments';
    case 'SUPER_ADMIN': return '/super-admin/shipments';
    default:            return '/merchant/shipments';
  }
}

@Component({
  selector: 'app-recent-shipments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-shipments.html',
  styleUrl: './recent-shipments.css',
})
export class RecentShipments implements OnInit, OnChanges {
  private http = inject(HttpClient);
  // Correct base URL — always /api/v1
  private readonly baseUrl =
    (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  /** Dynamically computed "View All" link based on the logged-in role */
  viewAllLink = viewAllRoute();

  /**
   * Parent can pass its own shipments array (e.g. merchant dashboard which
   * already loaded them for print/manifest modals). When provided we skip
   * the API call and just render. We also re-render on changes (OnChanges)
   * because the async data arrives after ngOnInit.
   */
  @Input() shipments: any[] | null = null;

  rows      = signal<ShipmentRow[]>([]);
  isLoading = signal(true);
  hasError  = signal(false);
  errorMsg  = signal('');

  ngOnInit(): void {
    this.viewAllLink = viewAllRoute();
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shipments']) {
      this.render();
    }
  }

  private render(): void {
    // If parent provided data, use it (even if it's an empty array = loaded, none yet)
    if (this.shipments !== null) {
      this.rows.set(this.shipments.slice(0, 5).map(mapLegacyRow));
      this.isLoading.set(false);
      this.hasError.set(false);
      return;
    }

    // Otherwise fetch from the API
    this.isLoading.set(true);
    this.http.get<any>(
      `${this.baseUrl}/shipments`,
      { params: new HttpParams().set('limit', '5').set('page', '1') },
    ).subscribe({
      next: (res) => {
        this.rows.set((res?.data?.shipments ?? []).map(mapApiRow));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || `HTTP ${err?.status ?? 'unknown'}`);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  statusClass(label: string): string {
    const entry = Object.values(STATUS_MAP).find(m => m.label === label);
    return entry?.css ?? 'pending';
  }
}
