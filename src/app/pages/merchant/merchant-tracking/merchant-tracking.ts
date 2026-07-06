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

  // ── Normalised shipment data for display ─────────────────────────────────
  activeDetails = signal<{
    awb:               string;
    carrierAWB:        string | null;
    courierName:       string | null;
    status:            string;
    origin:            string;
    destination:       string;
    recipientName:     string;
    recipientPhone:    string;
    estimatedDelivery: string | null;
    checkpoints:       { time: string; location: string; status: string; description: string }[];
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

        // ── Build status history / checkpoints ────────────────────────────
        // Prefer live Velocity tracking events; fall back to internal statusHistory.
        const velocityEvents: any[] = d.velocityTracking?.tracking_data || [];

        let checkpoints: { time: string; location: string; status: string; description: string }[] = [];

        if (velocityEvents.length > 0) {
          checkpoints = velocityEvents.map((e: any) => ({
            time:        e.date    || e.timestamp || '',
            location:    e.location               || '',
            status:      e.status  || e.remark    || '',
            description: e.remark  || e.activity  || e.status || '',
          }));
        } else if (Array.isArray(d.history) && d.history.length > 0) {
          // Internal status history
          checkpoints = d.history.map((h: any) => ({
            time:        h.timestamp ? new Date(h.timestamp).toLocaleString('en-IN') : '',
            location:    '',
            status:      h.status || '',
            description: h.note   || h.status || '',
          }));
        }

        this.activeDetails.set({
          awb:               d.awb              || awb,
          carrierAWB:        d.carrierAWB        || null,
          courierName:       d.carrier           || null,
          status:            d.status            || 'UNKNOWN',
          origin:            d.origin?.city
                               ? `${d.origin.city}, ${d.origin.state || ''}`
                               : (d.origin?.addressLine || '—'),
          destination:       d.destination?.city
                               ? `${d.destination.city}, ${d.destination.state || ''}`
                               : (d.destination?.addressLine || '—'),
          recipientName:     d.destination?.name  || '—',
          recipientPhone:    d.destination?.phone  || '—',
          estimatedDelivery: d.estimatedDelivery   || null,
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

  /** Map internal status codes to a human-readable stepper stage 0-3 */
  getStepperIndex(status: string): number {
    const s = (status || '').toUpperCase();
    if (['DELIVERED'].includes(s))                         return 3;
    if (['OUT_FOR_DELIVERY'].includes(s))                  return 2;
    if (['PICKED_UP', 'ARRIVED_AT_HUB', 'IN_TRANSIT'].includes(s)) return 1;
    return 0; // ORDER_CREATED / DELIVERY_FAILED / RTO / CANCELLED / UNKNOWN
  }
}
