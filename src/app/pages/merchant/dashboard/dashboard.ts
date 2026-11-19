import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ShipmentOverview } from '../../../components/shipment-overview/shipment-overview';
import { TopDestinations } from '../../../components/top-destinations/top-destinations';
import { CsvExportService } from '../../../shared/csv-export.service';
import { ShipmentService } from '../../../services/shipment.service';

type ModalSelectionMode = 'manifest' | null;

interface DashboardShipment {
  id: string;
  awb: string;
  carrierAWB: string | null;
  manifestUrl: string | null;
  customerName: string;
  destination: string;
  courier: string;
  status: string;
  date: string;
  amount: string;
  weight: string;
  weightKg: number;
  isCOD: boolean;
  codAmount: number;
  senderName: string;
  senderAddress: string;
  receiverAddress: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardHeader,
    StatsCards,
    RecentShipments,
    ShipmentOverview,
    TopDestinations,
    RouterLink,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class MarchandeDashboardPage implements OnInit {
  private csvService = inject(CsvExportService);
  private shipmentService = inject(ShipmentService);

  isLoading = signal(true);
  isShipmentsLoading = signal(false);

  dashboardStats: any = {};
  shipmentMeta: any = null;
  shipmentPage = 1;
  shipmentLimit = 10;

  cards = [
    { title: 'Total Orders', value: '-', icon: 'fas fa-box', iconColor: 'rgb(11, 74, 111)', bgColor: '#dbeafe' },
    { title: 'Pending Orders', value: '-', icon: 'fas fa-clock', iconColor: '#f59e0b', bgColor: '#fef3c7' },
    { title: 'In Transit', value: '-', icon: 'fas fa-truck', iconColor: '#0284c7', bgColor: '#e0f2fe' },
    { title: 'Delivered', value: '-', icon: 'fas fa-check-circle', iconColor: '#16a34a', bgColor: '#dcfce7' },
    { title: 'Cancelled', value: '-', icon: 'fas fa-cancel', iconColor: '#ef4444', bgColor: '#fee2e2' },
    { title: 'Failed / RTO', value: '-', icon: 'fas fa-scale-dispute', iconColor: '#dc2626', bgColor: '#fef2f2' },
    { title: 'Today\'s Orders', value: '-', icon: 'fas fa-store', iconColor: '#8b5cf6', bgColor: '#ede9fe' },
    { title: 'Total Spend', value: '-', icon: 'fas fa-indian-rupee-sign', iconColor: '#7c3aed', bgColor: '#f5f3ff' },
  ];

  shipments: DashboardShipment[] = [];

  showManifestModal = signal(false);
  modalMessage = signal<string | null>(null);
  manifestSelection: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);

    const stats$ = this.shipmentService.getStats().pipe(catchError(() => of(null)));
    const shipments$ = this.shipmentService
      .listShipments({ page: 1, limit: this.shipmentLimit })
      .pipe(catchError(() => of(null)));

    forkJoin([stats$, shipments$]).subscribe({
      next: ([statsRes, shipmentsRes]) => {
        const stats = statsRes?.data ?? statsRes ?? {};
        console.log('[Dashboard] Stats API response:', statsRes);
        console.log('[Dashboard] Resolved stats:', stats);
        console.log('[Dashboard] byStatus:', stats?.byStatus);
        this.applyStats(stats);
        this.applyShipmentResponse(shipmentsRes, null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[Dashboard] forkJoin error:', err);
        this.isLoading.set(false);
      },
    });
  }

  private applyStats(stats: any): void {
    this.dashboardStats = stats || {};
    const by = this.dashboardStats.byStatus || {};

    const getCount = (...keys: string[]): number => {
      let sum = 0;
      for (const k of keys) {
        sum += (by[k] || by[k.toUpperCase()] || by[k.toLowerCase()] || 0);
      }
      return sum;
    };

    // 0 — Total Orders
    this.cards[0].value = (this.dashboardStats.total || 0).toLocaleString('en-IN');

    // 1 — Pending Orders (ORDER_CREATED)
    this.cards[1].value = getCount('ORDER_CREATED').toLocaleString('en-IN');

    // 2 — In Transit (PICKED_UP + ARRIVED_AT_HUB + OUT_FOR_DELIVERY)
    this.cards[2].value = getCount('PICKED_UP', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY').toLocaleString('en-IN');

    // 3 — Delivered
    this.cards[3].value = getCount('DELIVERED').toLocaleString('en-IN');

    // 4 — Cancelled
    this.cards[4].value = getCount('CANCELLED').toLocaleString('en-IN');

    // 5 — Failed / RTO (DELIVERY_FAILED + RTO)
    this.cards[5].value = getCount('DELIVERY_FAILED', 'RTO').toLocaleString('en-IN');

    // 6 — Today's Orders
    this.cards[6].value = (this.dashboardStats.today || 0).toLocaleString('en-IN');

    // 7 — Total Spend
    this.cards[7].value = `₹${Number(this.dashboardStats.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private applyShipmentResponse(response: any, selectionMode: ModalSelectionMode): void {
    const raw = response?.data?.shipments || response?.data?.items || [];
    this.shipmentMeta = response?.meta || null;
    this.shipmentPage = this.shipmentMeta?.page || this.shipmentPage;
    this.shipments = raw.map((shipment: any) => this.mapShipment(shipment));

    this.shipments.forEach((shipment) => {
      if (selectionMode === 'manifest' && !(shipment.id in this.manifestSelection)) {
        this.manifestSelection[shipment.id] = true;
      }
    });
  }

  private mapShipment(shipment: any): DashboardShipment {
    const destinationCity = shipment.destination?.city || '';
    const destinationState = shipment.destination?.state || '';
    const originAddress = [
      shipment.origin?.addressLine,
      shipment.origin?.city,
      shipment.origin?.state,
      shipment.origin?.pincode,
    ].filter(Boolean).join(', ');
    const receiverAddress = [
      shipment.destination?.addressLine,
      shipment.destination?.city,
      shipment.destination?.state,
      shipment.destination?.pincode,
    ].filter(Boolean).join(', ');
    const weightKg = Number(shipment.weight || 0);

    return {
      id: shipment._id || shipment.id || shipment.awb,
      awb: shipment.awb || '-',
      carrierAWB: shipment.carrierAWB || null,
      manifestUrl: shipment.manifestUrl || null,
      customerName: shipment.destination?.name || '-',
      destination: [destinationCity, destinationState].filter(Boolean).join(', ') || '-',
      courier: shipment.carrier || 'Velocity',
      status: shipment.status || '-',
      date: shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '-',
      amount: `₹${Number(shipment.merchantCost || 0).toFixed(2)}`,
      weight: `${weightKg.toFixed(2)} kg`,
      weightKg,
      isCOD: Boolean(shipment.isCOD),
      codAmount: Number(shipment.codAmount || 0),
      senderName: shipment.origin?.name || '-',
      senderAddress: originAddress || '-',
      receiverAddress: receiverAddress || '-',
    };
  }

  get today(): Date {
    return new Date();
  }

  openManifestModal(): void {
    this.manifestSelection = {};
    this.modalMessage.set(null);
    this.showManifestModal.set(true);
    this.loadShipmentPage(1, 'manifest');
  }

  closeManifestModal(): void {
    this.showManifestModal.set(false);
    this.modalMessage.set(null);
  }

  loadShipmentPage(page: number, selectionMode: ModalSelectionMode = null): void {
    if (page < 1) return;
    this.isShipmentsLoading.set(true);
    this.shipmentService.listShipments({ page, limit: this.shipmentLimit }).subscribe({
      next: (response) => {
        this.applyShipmentResponse(response, selectionMode);
        this.isShipmentsLoading.set(false);
      },
      error: () => this.isShipmentsLoading.set(false),
    });
  }

  changeShipmentPage(delta: number, selectionMode: ModalSelectionMode = null): void {
    const nextPage = (this.shipmentMeta?.page || this.shipmentPage || 1) + delta;
    if (nextPage < 1 || (this.shipmentMeta?.pages && nextPage > this.shipmentMeta.pages)) return;
    this.loadShipmentPage(nextPage, selectionMode);
  }

  toggleAllManifest(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipments.forEach(shipment => { this.manifestSelection[shipment.id] = checked; });
  }

  isAllManifestSelected(): boolean {
    return this.shipments.length > 0 && this.shipments.every(shipment => this.manifestSelection[shipment.id]);
  }

  getSelectedManifestCount(): number {
    return this.shipments.filter(shipment => this.manifestSelection[shipment.id]).length;
  }

  getSelectedManifestWeight(): number {
    return this.shipments
      .filter(shipment => this.manifestSelection[shipment.id])
      .reduce((sum, shipment) => sum + shipment.weightKg, 0);
  }

  downloadCSVManifest(): void {
    const selected = this.shipments.filter(shipment => this.manifestSelection[shipment.id]);
    if (!selected.length) return;

    const headers = ['AWB', 'Carrier AWB', 'Customer', 'Destination', 'Courier', 'Weight', 'Amount', 'Date', 'Status'];
    const rows = selected.map(shipment => [
      shipment.awb,
      shipment.carrierAWB || '-',
      shipment.customerName,
      shipment.receiverAddress,
      shipment.courier,
      shipment.weight,
      shipment.amount,
      shipment.date,
      shipment.status,
    ]);
    this.csvService.export('Vexaro_Manifest', headers, rows);
    this.modalMessage.set(`Downloaded manifest CSV for ${selected.length} shipment(s).`);
  }

  openVelocityManifests(): void {
    const selected = this.shipments.filter(shipment => this.manifestSelection[shipment.id]);
    if (!selected.length) return;

    const withManifest = selected.filter(shipment => shipment.manifestUrl);
    const skipped = selected.length - withManifest.length;

    if (!withManifest.length) {
      this.modalMessage.set('Velocity manifest URLs are not available for the selected shipments. Use CSV export for a real-data handover sheet.');
      return;
    }

    withManifest.forEach((shipment) => {
      window.open(shipment.manifestUrl!, '_blank', 'noopener');
    });

    this.modalMessage.set(
      skipped
        ? `Opened ${withManifest.length} Velocity manifest(s). ${skipped} selected shipment(s) do not have manifest URLs yet.`
        : `Opened ${withManifest.length} Velocity manifest(s).`,
    );
  }

}
