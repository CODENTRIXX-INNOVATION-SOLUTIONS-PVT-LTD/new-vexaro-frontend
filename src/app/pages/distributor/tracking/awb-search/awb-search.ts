import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../../services/shipment.service';

interface ShipmentSummary {
  awb: string;
  carrierAWB: string;
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
  trackingUrl: string;
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
  source: string;
  isCurrent: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Order Created',
  PICKED_UP: 'Picked Up',
  ARRIVED_AT_HUB: 'Arrived at Hub',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed',
  RTO: 'RTO',
  CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-awb-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './awb-search.html',
  styleUrl: './awb-search.css',
})
export class AwbSearch implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private shipmentService = inject(ShipmentService);

  searchQuery = '';
  isLoading = false;
  hasSearched = false;
  error = '';

  shipment: ShipmentSummary | null = null;
  timeline: TimelineEvent[] = [];

  ngOnInit(): void {
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

    this.isLoading = true;
    this.hasSearched = true;
    this.error = '';
    this.shipment = null;
    this.timeline = [];

    this.shipmentService.trackAWB(q).subscribe({
      next: (res) => {
        const d = res?.data;
        if (!d) {
          this.error = `No shipment found for "${q}".`;
          this.isLoading = false;
          return;
        }

        this.shipment = {
          awb: d.awb,
          carrierAWB: d.carrierAWB || '',
          status: STATUS_LABELS[d.status] ?? this.formatStatus(d.status),
          rawStatus: d.status,
          customerName: d.destination?.name || '-',
          customerPhone: d.destination?.phone || '-',
          destCity: d.destination?.city || '-',
          destPincode: d.destination?.pincode || '-',
          originCity: d.origin?.city || '-',
          paymentType: d.isCOD ? 'COD' : 'Prepaid',
          codAmount: d.codAmount ?? 0,
          isCOD: d.isCOD ?? false,
          carrier: d.carrier ?? '-',
          trackingUrl: this.extractTrackingUrl(d) || '',
          weight: d.weight ?? 0,
        };

        this.timeline = this.buildTimeline(d);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || `Could not find shipment "${q}".`;
        this.isLoading = false;
      },
    });
  }

  viewHistory(): void {
    this.router.navigate(['/distributor/tracking/history'], {
      queryParams: { awb: this.shipment?.awb },
    });
  }

  private buildTimeline(data: any): TimelineEvent[] {
    const localHistory: any[] = Array.isArray(data.statusHistory)
      ? data.statusHistory
      : (Array.isArray(data.history) ? data.history : []);
    const velocityHistory = this.extractVelocityEvents(data.velocityTracking);

    const merged = [
      ...velocityHistory.map((e: any) => ({
        rawDate: this.eventTime(e),
        rawStatus: e.status || e.current_status || e.activity || e.remark || '',
        location: e.location || e.city || e.scan_location || e.scanLocation || data.destination?.city || '-',
        note: e.remark || e.activity || e.description || e.status || '',
        source: 'Velocity',
      })),
      ...localHistory.map((h: any) => ({
        rawDate: h.updatedAt || h.timestamp || h.createdAt,
        rawStatus: h.status,
        location: h.location || data.destination?.city || '-',
        note: h.note || h.description || '',
        source: 'Vexaro',
      })),
    ].sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());

    return merged.map((event: any, i: number) => {
      const dt = new Date(event.rawDate);
      const validDate = !Number.isNaN(dt.getTime());
      return {
        date: validDate ? dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        time: validDate ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
        status: STATUS_LABELS[event.rawStatus] ?? this.formatStatus(event.rawStatus),
        rawStatus: event.rawStatus,
        location: event.location,
        note: event.note,
        source: event.source,
        isCurrent: i === 0,
      };
    });
  }

  private formatStatus(status: string): string {
    return String(status || 'Tracking Update')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private eventTime(event: any): string {
    return event?.date
      || event?.timestamp
      || event?.time
      || event?.event_timestamp
      || event?.event_date_time
      || event?.scan_date_time
      || event?.created_at
      || '';
  }

  private extractVelocityEvents(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.tracking_data
      || raw.shipment_track_activities
      || raw.shipment_track
      || raw.track_activities
      || raw.activities
      || raw.events
      || raw.scans
      || [];
  }

  private extractTrackingUrl(data: any): string | null {
    return data?.trackingUrl
      || data?.velocityTracking?.tracking_url
      || data?.velocityTracking?.trackingUrl
      || data?.velocityTracking?.track_url
      || data?.velocityTracking?.tracking_data?.track_url
      || null;
  }
}
