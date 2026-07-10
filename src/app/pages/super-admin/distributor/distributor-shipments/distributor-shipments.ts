import { CommonModule } from '@angular/common';
import { Component, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ShipmentService, ShipmentListItem } from '../../../../services/shipment.service';
import { MerchantService } from '../../../../services/merchant.service';

interface DistributorShipment extends ShipmentListItem {
  shipmentId: string;
  date: string;
  amount: string;
  merchantId: string;
  merchantName: string;
}

@Component({
  standalone: true,
  selector: 'app-distributor-shipments',
  imports: [CommonModule],
  templateUrl: './distributor-shipments.html',
  styleUrls: ['../../../../common-css/super-admin-distrubutore-tabs.css']
})
export class DistributorShipments {
  private router = inject(Router);
  private shipmentService = inject(ShipmentService);
  private merchantService = inject(MerchantService);

  distributorId = input.required<string>();
  shipments: DistributorShipment[] = [];
  merchantMap: Map<string, string> = new Map();
  isLoading = signal(false);
  error = signal('');

  constructor() {
    // Use setTimeout to ensure input is bound before loading
    setTimeout(() => {
      this.loadShipments();
    }, 0);
  }

  private loadShipments(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.shipmentService.listShipments({ distributor: this.distributorId(), page: 1, limit: 50 }).subscribe({
      next: (res) => {
        const shipments = (res.data.shipments ?? []).filter((s: any) => s.distributorId === this.distributorId());
        const merchantIds = [...new Set(shipments.map((s: any) => s.merchantId))];
        
        // Load merchant names
        this.loadMerchantNames(merchantIds);
        
        this.shipments = shipments.map((shipment: any) => ({
          ...shipment,
          shipmentId: shipment.awb,
          date: new Date(shipment.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          amount: shipment.merchantCost != null ? `₹${shipment.merchantCost.toLocaleString('en-IN')}` : '—',
          merchantId: shipment.merchantId,
          merchantName: this.merchantMap.get(shipment.merchantId) || 'Loading...',
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load shipments.');
        this.isLoading.set(false);
      },
    });
  }

  private loadMerchantNames(merchantIds: string[]): void {
    merchantIds.forEach(id => {
      this.merchantService.getMerchantById(id).subscribe({
        next: (res) => {
          const merchant = res.data;
          this.merchantMap.set(id, merchant.companyName || `${merchant.firstName} ${merchant.lastName}`);
          // Update shipments with loaded merchant name
          this.shipments = this.shipments.map(s => 
            s.merchantId === id ? { ...s, merchantName: this.merchantMap.get(id) || '—' } : s
          );
        },
        error: () => {
          this.merchantMap.set(id, '—');
        }
      });
    });
  }

  navigateToMerchant(merchantId: string): void {
    this.router.navigate(['/super-admin/merchants/profile', merchantId]);
  }
}
