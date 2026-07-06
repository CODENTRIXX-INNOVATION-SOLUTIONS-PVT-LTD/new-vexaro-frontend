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
    const history = this.shipment?.history || this.shipment?.statusHistory || [];
    return history.length ? history[history.length - 1] : null;
  }

  get trackingUrl(): string | null {
    return this.shipment?.velocityTracking?.tracking_data?.track_url
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
}
