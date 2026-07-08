import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentService } from '../../../services/shipment.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-merchant-tracking',
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-tracking.html',
  styleUrl: './merchant-tracking.css',
})
export class MerchantTracking {
  private shipmentService = inject(ShipmentService);

  searchQuery = signal<string>('');
  isLoading   = signal<boolean>(false);
  hasSearched = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // â”€â”€ Normalised shipment data for display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  activeDetails = signal<{
    awb:               string;
    carrierAWB:        string | null;
    courierName:       string | null;
    status:            string;
    statusLabel:       string;
    origin:            string;
    destination:       string;
    recipientName:     string;
    recipientPhone:    string;
    estimatedDelivery: string | null;
    trackingUrl:       string | null;
    checkpoints:       { time: string; location: string; status: string; description: string; source: string }[];
  } | null>(null);

  trackShipment(): void {
    const awb = this.searchQuery().trim().toUpperCase();
    if (!awb) return;

    this.hasSearched.set(true);
    this.errorMessage.set(null);
    this.activeDetails.set(null);
    this.isLoading.set(true);

    this.shipmentService.trackAWB(awb).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (res) => {
        const d = res.data || res;

        const velocityEvents: any[] = this.extractVelocityEvents(d.velocityTracking);
        const localEvents: any[] = Array.isArray(d.statusHistory) ? d.statusHistory : (Array.isArray(d.history) ? d.history : []);
        const checkpoints = [
          ...velocityEvents.map((e: any) => ({
            time:        this.eventTime(e),
            location:    e.location || e.city || e.scan_location || e.scanLocation || '',
            status:      this.formatStatus(e.status || e.current_status || e.activity || e.remark || ''),
            description: e.remark || e.activity || e.description || e.status || '',
            source:      'Velocity',
          })),
          ...localEvents.map((h: any) => ({
            time:        h.timestamp || h.updatedAt || h.createdAt || '',
            location:    h.location || '',
            status:      this.formatStatus(h.status || ''),
            description: h.note || h.description || h.status || '',
            source:      'Vexaro',
          })),
        ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());

        const status = d.status || 'UNKNOWN';
        this.activeDetails.set({
          awb:               d.awb              || awb,
          carrierAWB:        d.carrierAWB        || null,
          courierName:       d.carrier           || null,
          status,
          statusLabel:       this.formatStatus(status),
          origin:            this.formatAddress(d.origin),
          destination:       this.formatAddress(d.destination),
          recipientName:     d.destination?.name  || '-',
          recipientPhone:    this.formatPhone(d.destination?.phone),
          estimatedDelivery: this.normalizeDate(d.estimatedDelivery || d.originalEstimatedDelivery),
          trackingUrl:       this.extractTrackingUrl(d),
          checkpoints,
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'No shipment found for this AWB.';
        this.errorMessage.set(msg);
      },
    });
  }

  quickTrack(awb: string): void {
    this.searchQuery.set(awb);
    this.trackShipment();
  }

  formatStatus(status: string): string {
    return String(status || 'Unknown')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private formatPhone(phone: string | null | undefined): string {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '-';
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  }

  private formatAddress(address: any): string {
    if (!address) return '-';
    return [
      address.addressLine,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ].filter(Boolean).join(', ') || '-';
  }

  private normalizeDate(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      return value.date || value.delivery_date || value.edd || value.estimated_delivery_date || null;
    }
    return null;
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

  /** Map internal status codes to a human-readable stepper stage 0-3 */
  getStepperIndex(status: string): number {
    const s = (status || '').toUpperCase();
    if (['DELIVERED'].includes(s))                         return 3;
    if (['OUT_FOR_DELIVERY'].includes(s))                  return 2;
    if (['PICKED_UP', 'ARRIVED_AT_HUB', 'IN_TRANSIT'].includes(s)) return 1;
    return 0; // ORDER_CREATED / DELIVERY_FAILED / RTO / CANCELLED / UNKNOWN
  }
}
