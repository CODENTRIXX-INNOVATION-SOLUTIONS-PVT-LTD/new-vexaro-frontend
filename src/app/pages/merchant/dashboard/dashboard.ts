import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ShipmentOverview } from '../../../components/shipment-overview/shipment-overview';
import { TopDestinations } from '../../../components/top-destinations/top-destinations';
import { RouterLink } from '@angular/router';
import { CsvExportService } from '../../../shared/csv-export.service';
import { ShipmentService } from '../../../services/shipment.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardHeader, StatsCards, RecentShipments,
    ShipmentOverview, TopDestinations, RouterLink,
    CommonModule, FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class MarchandeDashboardPage implements OnInit {
  private csvService      = inject(CsvExportService);
  private shipmentService = inject(ShipmentService);
  private authService     = inject(AuthService);

  isLoading = signal(true);

  cards = [
    { title: 'Total Shipments', value: '—', icon: 'fas fa-box',                iconColor: 'rgb(11, 74, 111)', bgColor: '#dbeafe' },
    { title: 'Delivered',       value: '—', icon: 'fas fa-check-circle',        iconColor: '#16a34a',          bgColor: '#dcfce7' },
    { title: 'In Transit',      value: '—', icon: 'fas fa-truck',               iconColor: 'rgb(232, 116, 58)', bgColor: '#fef3c7' },
    { title: 'Pending Pickup',  value: '—', icon: 'fas fa-clock',               iconColor: '#dc2626',          bgColor: '#fee2e2' },
    { title: 'Total Spend',     value: '—', icon: 'fas fa-indian-rupee-sign',   iconColor: '#7c3aed',          bgColor: '#ede9fe' },
  ];

  // Real shipments used for print-label / manifest modals
  shipments: any[] = [];

  // Modal state
  showPrintModal    = signal(false);
  showManifestModal = signal(false);
  selectedShipmentForPreview = signal<any>(null);
  printSelection:    Record<string, boolean> = {};
  manifestSelection: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);

    const stats$   = this.shipmentService.getStats().pipe(catchError(() => of(null)));
    const recent$  = this.shipmentService.listShipments({ limit: 5 }).pipe(catchError(() => of(null)));

    forkJoin([stats$, recent$]).subscribe({
      next: ([statsRes, recentRes]) => {
        // ── Stats cards ──────────────────────────────────────────────────
        const s  = statsRes?.data ?? statsRes;
        const by = s?.byStatus ?? {};

        this.cards[0].value = (s?.total ?? 0).toLocaleString('en-IN');
        this.cards[1].value = (by.DELIVERED      ?? 0).toLocaleString('en-IN');
        this.cards[2].value = (
          (by.PICKED_UP ?? 0) + (by.ARRIVED_AT_HUB ?? 0) + (by.OUT_FOR_DELIVERY ?? 0)
        ).toLocaleString('en-IN');
        this.cards[3].value = (by.ORDER_CREATED  ?? 0).toLocaleString('en-IN');
        this.cards[4].value = `₹${(s?.totalCost ?? 0).toLocaleString('en-IN')}`;

        // ── Recent shipments for print/manifest modal ─────────────────
        const raw: any[] = recentRes?.data?.shipments ?? [];
        this.shipments = raw.map(sh => ({
          id:              sh.awb,
          awb:             sh.awb,
          carrierAWB:      sh.carrierAWB ?? null,
          labelUrl:        sh.labelUrl   ?? null,
          customerName:    sh.destination?.name   ?? '—',
          destination:     `${sh.destination?.city ?? ''}, ${sh.destination?.state ?? ''}`.replace(/^,\s*|,\s*$/, ''),
          courier:         sh.carrier    ?? '—',
          status:          sh.status,
          date:            new Date(sh.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount:          `₹${(sh.merchantCost ?? 0).toFixed(2)}`,
          weight:          `${sh.weight ?? 0} kg`,
          isCOD:           sh.isCOD ?? false,
          codAmount:       sh.codAmount ?? 0,
          senderName:      sh.origin?.name        ?? '—',
          senderAddress:   `${sh.origin?.addressLine ?? ''}, ${sh.origin?.city ?? ''}, ${sh.origin?.state ?? ''} - ${sh.origin?.pincode ?? ''}`,
          receiverAddress: `${sh.destination?.addressLine ?? ''}, ${sh.destination?.city ?? ''}, ${sh.destination?.state ?? ''} - ${sh.destination?.pincode ?? ''}`,
        }));

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get today(): Date { return new Date(); }

  // ── Print modal helpers ───────────────────────────────────────────────────
  openPrintModal(): void {
    this.shipments.forEach(s => { this.printSelection[s.id] = true; });
    if (this.shipments.length) this.selectedShipmentForPreview.set(this.shipments[0]);
    this.showPrintModal.set(true);
  }
  closePrintModal(): void { this.showPrintModal.set(false); }

  openManifestModal(): void {
    this.shipments.forEach(s => { this.manifestSelection[s.id] = true; });
    this.showManifestModal.set(true);
  }
  closeManifestModal(): void { this.showManifestModal.set(false); }

  selectPreview(s: any): void { this.selectedShipmentForPreview.set(s); }

  toggleAllPrint(e: Event): void {
    const v = (e.target as HTMLInputElement).checked;
    this.shipments.forEach(s => { this.printSelection[s.id] = v; });
  }
  toggleAllManifest(e: Event): void {
    const v = (e.target as HTMLInputElement).checked;
    this.shipments.forEach(s => { this.manifestSelection[s.id] = v; });
  }

  isAllPrintSelected():    boolean { return this.shipments.every(s => this.printSelection[s.id]); }
  isAllManifestSelected(): boolean { return this.shipments.every(s => this.manifestSelection[s.id]); }
  getSelectedPrintCount():    number { return this.shipments.filter(s => this.printSelection[s.id]).length; }
  getSelectedManifestCount(): number { return this.shipments.filter(s => this.manifestSelection[s.id]).length; }
  getSelectedManifestWeight(): number {
    return this.shipments
      .filter(s => this.manifestSelection[s.id])
      .reduce((sum, s) => sum + parseFloat(s.weight), 0);
  }

  // ── Print labels (uses real carrier AWB + labelUrl if available) ──────────
  printLabels(): void {
    const selected = this.shipments.filter(s => this.printSelection[s.id]);
    if (!selected.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let labelsHtml = '';
    selected.forEach(s => {
      // If Velocity returned a label URL, open it directly
      if (s.labelUrl) {
        labelsHtml += `<div class="label-container"><p style="text-align:center;font-size:14px;">Label available: <a href="${s.labelUrl}" target="_blank">${s.labelUrl}</a></p><p style="text-align:center;font-size:18px;font-weight:bold;">AWB: ${s.awb}</p></div>`;
        return;
      }
      labelsHtml += `
        <div class="label-container">
          <div class="label-header"><div class="courier-title">${s.courier}</div><div class="awb-text">AWB: ${s.carrierAWB || s.awb}</div></div>
          <div class="barcode-area"><div class="barcode-placeholder"></div><div class="barcode-digits">${s.carrierAWB || s.awb}</div></div>
          <div class="address-grid">
            <div class="address-box sender"><strong>SENDER:</strong><div>${s.senderName}</div><div>${s.senderAddress}</div></div>
            <div class="address-box receiver"><strong>RECEIVER:</strong><div>${s.customerName}</div><div>${s.receiverAddress}</div></div>
          </div>
          <div class="label-footer">
            <div>Date: ${s.date}</div><div>Weight: ${s.weight}</div>
            <div class="amount-badge">${s.isCOD ? 'COD: ₹' + s.codAmount : 'PREPAID'}</div>
          </div>
        </div>`;
    });

    printWindow.document.write(`<html><head><title>Shipping Labels</title><style>
      body{font-family:sans-serif;margin:0;padding:20px;background:#f8fafc;}
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
      @media print{body{background:#fff;padding:0;}.label-container{margin:0;page-break-after:always;}}
    </style></head><body>${labelsHtml}
    <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script></body></html>`);
    printWindow.document.close();
  }

  // ── CSV manifest ──────────────────────────────────────────────────────────
  downloadCSVManifest(): void {
    const selected = this.shipments.filter(s => this.manifestSelection[s.id]);
    if (!selected.length) return;
    const headers = ['AWB', 'Carrier AWB', 'Customer', 'Destination', 'Courier', 'Weight', 'Amount', 'Date', 'Status'];
    const rows = selected.map(s => [s.awb, s.carrierAWB || '—', s.customerName, s.receiverAddress, s.courier, s.weight, s.amount, s.date, s.status]);
    this.csvService.export('Vexaro_Manifest', headers, rows);
  }

  // ── PDF manifest ──────────────────────────────────────────────────────────
  printPDFManifest(): void {
    const selected = this.shipments.filter(s => this.manifestSelection[s.id]);
    if (!selected.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Read merchant name from storage
    let merchantName = 'Merchant';
    try { const u = JSON.parse(localStorage.getItem('user') || 'null'); if (u) merchantName = u.companyName || `${u.firstName} ${u.lastName}`.trim(); } catch { /* */ }

    const rowsHtml = selected.map((s, i) => `
      <tr><td>${i + 1}</td><td><strong>${s.awb}</strong>${s.carrierAWB ? '<br><small>' + s.carrierAWB + '</small>' : ''}</td>
      <td>${s.customerName}</td><td>${s.receiverAddress}</td><td>${s.courier}</td>
      <td>${s.weight}</td><td>${s.amount}</td><td>${s.status}</td></tr>`).join('');

    printWindow.document.write(`<html><head><title>Manifest</title><style>
      body{font-family:sans-serif;padding:30px;color:#333;}
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
        <strong>Merchant:</strong> ${merchantName}
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
}
