import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentService } from '../../../../services/shipment.service';

interface ShipmentViewModel {
  shipmentId: string;
  orderId: string;
  destination: string;
  dispatchDate: string;
  status: string;
}

@Component({
  selector: 'app-merchant-shipments',
  imports: [CommonModule],
  templateUrl: './merchant-shipments.html',
  styleUrl: './merchant-shipments.css',
})
export class MerchantShipments implements OnInit {
  merchantId = input.required<string>();
  private shipmentService = inject(ShipmentService);

  isLoading = signal(true);
  errorMessage = signal('');
  shipments: ShipmentViewModel[] = [];

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shipmentService.getShipmentsByMerchant(this.merchantId(), { limit: 50 }).subscribe({
      next: (res) => {
        if (res.success && res.data?.shipments) {
          this.shipments = res.data.shipments.map((s: any) => ({
            shipmentId: s.awb || s.id || '—',
            orderId: s.id || '—',
            destination: s.destination?.city || s.destination || '—',
            dispatchDate: s.createdAt
              ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—',
            status: this.formatStatus(s.status)
          }));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load shipments');
        this.isLoading.set(false);
      }
    });
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DELIVERED': 'Delivered',
      'IN_TRANSIT': 'In Transit',
      'PENDING': 'Pending',
      'CANCELLED': 'Cancelled',
      'RETURNED': 'Returned',
      'OUT_FOR_DELIVERY': 'Out for Delivery'
    };
    return statusMap[status] || status;
  }
}