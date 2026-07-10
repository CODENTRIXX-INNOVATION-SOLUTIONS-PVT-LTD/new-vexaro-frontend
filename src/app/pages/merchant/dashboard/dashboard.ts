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
    { title: 'Total Shipments', value: '-', icon: 'fas fa-box', iconColor: 'rgb(11, 74, 111)', bgColor: '#dbeafe' },
    { title: 'Delivered', value: '-', icon: 'fas fa-check-circle', iconColor: '#16a34a', bgColor: '#dcfce7' },
    { title: 'In Transit', value: '-', icon: 'fas fa-truck', iconColor: 'rgb(232, 116, 58)', bgColor: '#fef3c7' },
    { title: 'Pending Pickup', value: '-', icon: 'fas fa-clock', iconColor: '#dc2626', bgColor: '#fee2e2' },
    { title: 'Total Spend', value: '-', icon: 'fas fa-indian-rupee-sign', iconColor: '#7c3aed', bgColor: '#ede9fe' },
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
        this.applyStats(statsRes?.data ?? statsRes ?? {});
        this.applyShipmentResponse(shipmentsRes, null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private applyStats(stats: any): void {
    this.dashboardStats = stats || {};
    const by = this.dashboardStats.byStatus || {};

    this.cards[0].value = (this.dashboardStats.total || 0).toLocaleString('en-IN');
    this.cards[1].value = (by.DELIVERED || 0).toLocaleString('en-IN');
    this.cards[2].value = (
      (by.PICKED_UP || 0) +
      (by.ARRIVED_AT_HUB || 0) +
      (by.OUT_FOR_DELIVERY || 0)
    ).toLocaleString('en-IN');
    this.cards[3].value = (by.ORDER_CREATED || 0).toLocaleString('en-IN');
    this.cards[4].value = `₹${(this.dashboardStats.totalCost || 0).toLocaleString('en-IN')}`;
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
