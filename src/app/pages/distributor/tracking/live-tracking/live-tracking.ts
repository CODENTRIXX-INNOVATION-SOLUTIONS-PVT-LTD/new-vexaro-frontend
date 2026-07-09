import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from '../../../../services/shipment.service';

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-tracking.html',
  styleUrl: './live-tracking.css'
})
export class LiveTracking implements OnInit {
  awb: string = '';
  isLoading = false;
  error = '';
  shipment: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shipmentService: ShipmentService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.awb = params['awb'] || '';
      if (this.awb) {
        this.loadTracking();
      }
    });
  }

  get latestEvent(): any {
    const events = this.trackingEvents;
    return events.length ? events[0] : null;
  }

  get trackingEvents(): any[] {
    if (!this.shipment) return [];
    const velocityEvents = this.extractVelocityEvents(this.shipment.velocityTracking).map((event: any) => ({
      timestamp: this.eventTime(event),
      status: event.status || event.current_status || event.activity || event.remark || 'Tracking Update',
      note: event.remark || event.activity || event.description || event.status || '',
      location: event.location || event.city || event.scan_location || event.scanLocation || '',
      source: 'Velocity',
    }));
    const localEvents = (this.shipment.history || this.shipment.statusHistory || []).map((event: any) => ({
      timestamp: event.timestamp || event.updatedAt || event.createdAt,
      status: event.status || 'Tracking Update',
      note: event.note || event.description || '',
      location: event.location || this.shipment.destination?.city || '',
      source: 'Vexaro',
    }));
    return [...velocityEvents, ...localEvents]
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }

  get trackingUrl(): string | null {
    return this.shipment?.trackingUrl
      || this.shipment?.velocityTracking?.tracking_url
      || this.shipment?.velocityTracking?.trackingUrl
      || this.shipment?.velocityTracking?.track_url
      || this.shipment?.velocityTracking?.tracking_data?.track_url
      || this.shipment?.velocityTracking?.trackingUrl
      || null;
  }

  loadTracking(): void {
    if (!this.awb.trim()) {
      this.error = 'Enter an AWB from the tracking search page.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.shipment = null;

    this.shipmentService.trackAWB(this.awb.trim()).subscribe({
      next: (res) => {
        this.shipment = res?.data || res;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || `Could not fetch tracking for AWB ${this.awb}.`;
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/distributor/tracking/search']);
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
}
