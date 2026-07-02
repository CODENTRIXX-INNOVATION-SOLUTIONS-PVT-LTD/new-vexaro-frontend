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
  lastPing: string = 'Just now';
  speed: string = '0 km/h';
  isLoading: boolean = false;
  trackingData: any = null;

  constructor(private route: ActivatedRoute, private router: Router, private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.awb = params['awb'] || 'VEX-DEMO';
      if (this.awb) {
        this.loadLiveTracking();
      }
    });
  }

  loadLiveTracking() {
    this.isLoading = true;
    this.shipmentService.trackAWB(this.awb).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.trackingData = response.data;
          this.lastPing = response.data.lastPing || 'Just now';
          this.speed = response.data.speed ? `${response.data.speed} km/h` : '0 km/h';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading live tracking:', error);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/distributor/tracking/search']);
  }
}
