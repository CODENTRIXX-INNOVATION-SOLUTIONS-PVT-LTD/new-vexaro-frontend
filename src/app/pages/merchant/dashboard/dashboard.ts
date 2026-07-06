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

type ModalSelectionMode = 'print' | 'manifest' | null;

interface DashboardShipment {
  id: string;
  awb: string;
  carrierAWB: string | null;
  labelUrl: string | null;
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

  showPrintModal = signal(false);
  showManifestModal = signal(false);
  selectedShipmentForPreview = signal<any>(null);
  printSelection: Record<string, boolean> = {};
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
    this.cards[4].value = `INR ${(this.dashboardStats.totalCost || 0).toLocaleString('en-IN')}`;
  }

  private applyShipmentResponse(response: any, selectionMode: ModalSelectionMode): void {
    const raw = response?.data?.shipments || response?.data?.items || [];
    this.shipmentMeta = response?.meta || null;
    this.shipmentPage = this.shipmentMeta?.page || this.shipmentPage;
    this.shipments = raw.map((shipment: any) => this.mapShipment(shipment));

    this.shipments.forEach((shipment) => {
      if (!(shipment.id in this.printSelection)) this.printSelection[shipment.id] = selectionMode === 'print';
      if (!(shipment.id in this.manifestSelection)) this.manifestSelection[shipment.id] = selectionMode === 'manifest';
    });

    if (!this.selectedShipmentForPreview() || !this.shipments.some(s => s.id === this.selectedShipmentForPreview()?.id)) {
      this.selectedShipmentForPreview.set(this.shipments[0] || null);
    }
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
      labelUrl: shipment.labelUrl || null,
      customerName: shipment.destination?.name || '-',
      destination: [destinationCity, destinationState].filter(Boolean).join(', ') || '-',
      courier: shipment.carrier || 'Velocity',
      status: shipment.status || '-',
      date: shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-',
      amount: `INR ${Number(shipment.merchantCost || 0).toFixed(2)}`,
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

  openPrintModal(): void {
    this.printSelection = {};
    this.showPrintModal.set(true);
    this.loadShipmentPage(1, 'print');
  }

  closePrintModal(): void {
    this.showPrintModal.set(false);
  }

  openManifestModal(): void {
    this.manifestSelection = {};
    this.showManifestModal.set(true);
    this.loadShipmentPage(1, 'manifest');
  }

  closeManifestModal(): void {
    this.showManifestModal.set(false);
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

  selectPreview(shipment: DashboardShipment): void {
    this.selectedShipmentForPreview.set(shipment);
  }

  toggleAllPrint(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipments.forEach(shipment => { this.printSelection[shipment.id] = checked; });
  }

  toggleAllManifest(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipments.forEach(shipment => { this.manifestSelection[shipment.id] = checked; });
  }

  isAllPrintSelected(): boolean {
    return this.shipments.length > 0 && this.shipments.every(shipment => this.printSelection[shipment.id]);
  }

  isAllManifestSelected(): boolean {
    return this.shipments.length > 0 && this.shipments.every(shipment => this.manifestSelection[shipment.id]);
  }

  getSelectedPrintCount(): number {
    return this.shipments.filter(shipment => this.printSelection[shipment.id]).length;
  }

  getSelectedManifestCount(): number {
    return this.shipments.filter(shipment => this.manifestSelection[shipment.id]).length;
  }

  getSelectedManifestWeight(): number {
    return this.shipments
      .filter(shipment => this.manifestSelection[shipment.id])
      .reduce((sum, shipment) => sum + shipment.weightKg, 0);
  }

  printLabels(): void {
    const selected = this.shipments.filter(shipment => this.printSelection[shipment.id]);
    if (!selected.length) return;

    if (selected.length === 1 && selected[0].labelUrl) {
      window.open(selected[0].labelUrl, '_blank', 'noopener');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = selected.map(shipment => this.buildLabelHtml(shipment)).join('');

    printWindow.document.write(`<html><head><title>Shipping Labels</title><style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f8fafc;}
      .label-container{background:#fff;border:3px solid #000;padding:20px;width:380px;margin:0 auto 30px;page-break-inside:avoid;}
      .label-header{display:flex;justify-content:space-between;border-bottom:3px solid #000;padding-bottom:10px;margin-bottom:10px;}
      .courier-title{font-size:20px;font-weight:900;text-transform:uppercase;}
      .awb-text{font-size:14px;font-weight:800;align-self:center;}
      .barcode-area{text-align:center;padding:15px 0;border-bottom:3px solid #000;margin-bottom:10px;}
      .barcode-placeholder{height:55px;background:repeating-linear-gradient(90deg,#000,#000 3px,#fff 3px,#fff 7px);margin:0 auto;width:90%;}
      .barcode-digits{font-family:monospace;font-size:14px;margin-top:5px;font-weight:bold;letter-spacing:2px;}
      .address-grid{display:flex;flex-direction:column;gap:12px;font-size:12px;border-bottom:3px solid #000;padding-bottom:12px;margin-bottom:10px;}
      .label-footer{display:flex;justify-content:space-between;font-size:12px;font-weight:bold;}
      .amount-badge{font-size:13px;border:1px solid #000;padding:4px 8px;background:#000;color:#fff;}
      .label-link{font-size:12px;line-height:1.4;margin-bottom:12px;word-break:break-all;}
      @media print{body{background:#fff;padding:0;}.label-container{margin:0;page-break-after:always;}}
    </style></head><body>${labelsHtml}
    <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script></body></html>`);
    printWindow.document.close();
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
  }

  printPDFManifest(): void {
    const selected = this.shipments.filter(shipment => this.manifestSelection[shipment.id]);
    if (!selected.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const merchantName = this.getMerchantName();
    const rowsHtml = selected.map((shipment, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${this.escapeHtml(shipment.awb)}</strong>${shipment.carrierAWB ? '<br><small>' + this.escapeHtml(shipment.carrierAWB) + '</small>' : ''}</td>
        <td>${this.escapeHtml(shipment.customerName)}</td>
        <td>${this.escapeHtml(shipment.receiverAddress)}</td>
        <td>${this.escapeHtml(shipment.courier)}</td>
        <td>${this.escapeHtml(shipment.weight)}</td>
        <td>${this.escapeHtml(shipment.amount)}</td>
        <td>${this.escapeHtml(shipment.status)}</td>
      </tr>`).join('');

    printWindow.document.write(`<html><head><title>Manifest</title><style>
      body{font-family:Arial,sans-serif;padding:30px;color:#333;}
      .title{font-size:24px;font-weight:800;text-transform:uppercase;color:#0f172a;}
      .meta{text-align:right;font-size:13px;color:#475569;line-height:1.5;}
      table{width:100%;border-collapse:collapse;margin-bottom:40px;}
      th,td{border:1px solid #cbd5e1;padding:10px 12px;font-size:12px;text-align:left;}
      th{background:#f1f5f9;font-weight:700;}
      tr:nth-child(even){background:#f8fafc;}
      .sig{border-top:1px dashed #475569;text-align:center;padding-top:10px;font-size:13px;color:#475569;margin-top:50px;}
      @media print{body{padding:0;}}
    </style></head><body>
    <table style="width:100%;margin-bottom:30px;border:none;"><tr>
      <td style="border:none;"><div class="title">VEXARO SHIPPING MANIFEST</div></td>
      <td style="border:none;" class="meta">
        <strong>Manifest ID:</strong> MN-${Date.now().toString().slice(-6)}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br>
        <strong>Merchant:</strong> ${this.escapeHtml(merchantName)}
      </td></tr></table>
    <table><thead><tr><th>S.No</th><th>AWB</th><th>Recipient</th><th>Address</th><th>Courier</th><th>Weight</th><th>Value</th><th>Status</th></tr></thead>
    <tbody>${rowsHtml}</tbody></table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;">
      <div class="sig">Merchant Signature</div>
      <div class="sig">Courier Agent Signature</div>
    </div>
    <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script>
    </body></html>`);
    printWindow.document.close();
  }

  private buildLabelHtml(shipment: DashboardShipment): string {
    const awb = shipment.carrierAWB || shipment.awb;
    const labelLink = shipment.labelUrl
      ? `<div class="label-link"><strong>Velocity Label:</strong> <a href="${this.escapeAttr(shipment.labelUrl)}" target="_blank">${this.escapeHtml(shipment.labelUrl)}</a></div>`
      : '';

    return `
      <div class="label-container">
        ${labelLink}
        <div class="label-header">
          <div class="courier-title">${this.escapeHtml(shipment.courier)}</div>
          <div class="awb-text">AWB: ${this.escapeHtml(awb)}</div>
        </div>
        <div class="barcode-area">
          <div class="barcode-placeholder"></div>
          <div class="barcode-digits">${this.escapeHtml(awb)}</div>
        </div>
        <div class="address-grid">
          <div class="address-box sender"><strong>SENDER:</strong><div>${this.escapeHtml(shipment.senderName)}</div><div>${this.escapeHtml(shipment.senderAddress)}</div></div>
          <div class="address-box receiver"><strong>RECEIVER:</strong><div>${this.escapeHtml(shipment.customerName)}</div><div>${this.escapeHtml(shipment.receiverAddress)}</div></div>
        </div>
        <div class="label-footer">
          <div>Date: ${this.escapeHtml(shipment.date)}</div>
          <div>Weight: ${this.escapeHtml(shipment.weight)}</div>
          <div class="amount-badge">${shipment.isCOD ? 'COD: INR ' + shipment.codAmount : 'PREPAID'}</div>
        </div>
      </div>`;
  }

  private getMerchantName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user) return user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Merchant';
    } catch {
      return 'Merchant';
    }
    return 'Merchant';
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeAttr(value: unknown): string {
    return this.escapeHtml(value).replace(/`/g, '&#096;');
  }
}
