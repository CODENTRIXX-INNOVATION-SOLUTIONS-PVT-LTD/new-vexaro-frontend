import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ShipmentService, ShipmentListItem } from '../../../../services/shipment.service';

interface DistributorShipment extends ShipmentListItem {
  shipmentId: string;
  date: string;
  amount: string;
}

@Component({
  standalone: true,
  selector: 'app-distributor-shipments',
  imports: [CommonModule],
  templateUrl: './distributor-shipments.html',
  styleUrls: ['../../../../common-css/super-admin-distrubutore-tabs.css']
})
export class DistributorShipments implements OnInit {
  shipments: DistributorShipment[] = [];
  isLoading = false;
  error = '';

  constructor(private shipmentService: ShipmentService) { }

  ngOnInit(): void {
    this.loadShipments();
  }

  private loadShipments(): void {
    this.isLoading = true;
    this.error = '';

    this.shipmentService.listShipments({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        this.shipments = (res.data.shipments ?? []).map((shipment) => ({
          ...shipment,
          shipmentId: shipment.awb,
          date: new Date(shipment.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          amount: shipment.merchantCost != null ? `₹${shipment.merchantCost.toLocaleString('en-IN')}` : '—',
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load shipments.';
        this.isLoading = false;
      },
    });
  }
}
