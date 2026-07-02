import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ShipmentOverview } from '../../../components/shipment-overview/shipment-overview';
import { TopDestinations } from '../../../components/top-destinations/top-destinations';
import { RouterLink } from '@angular/router';
import { CsvExportService } from '../../../shared/csv-export.service';

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
    FormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class MarchandeDashboardPage {
  private csvService = inject(CsvExportService);

  cards = [
    {
      title: 'Total Shipments',
      value: '12,678',
      icon: 'fas fa-box',
      iconColor: 'rgb(11, 74, 111)',
      bgColor: '#dbeafe'
    },
    {
      title: 'Delivered',
      value: '10,426',
      icon: 'fas fa-check-circle',
      iconColor: '#16a34a',
      bgColor: '#dcfce7'
    },
    {
      title: 'In Transit',
      value: '1,890',
      icon: 'fas fa-truck',
      iconColor: 'rgb(232, 116, 58)',
      bgColor: '#fef3c7'
    },
    {
      title: 'Pending',
      value: '362',
      icon: 'fas fa-clock',
      iconColor: '#dc2626',
      bgColor: '#fee2e2'
    },
    {
      title: 'Total Revenue',
      value: '₹45,67,890',
      icon: 'fas fa-indian-rupee-sign',
      iconColor: '#7c3aed',
      bgColor: '#ede9fe'
    }
  ];

  // Shipments matching the recent shipments but enriched for labels/manifests
  shipments = [
    {
      id: 'VX001245',
      customerName: 'Rahul Sharma',
      destination: 'Mumbai, MH',
      courier: 'Blue Dart',
      status: 'Delivered',
      date: '10 Jun 2026',
      amount: '₹2,450',
      weight: '1.5 kg',
      senderName: 'Sahil Gour',
      senderAddress: 'Vasamo Store, 123, Sector 5, Noida, UP - 201301',
      receiverAddress: 'Flat 402, Sea Breeze Apts, Juhu Tara Road, Mumbai, MH - 400049'
    },
    {
      id: 'VX001246',
      customerName: 'Priya Singh',
      destination: 'Delhi, DL',
      courier: 'Delhivery',
      status: 'In Transit',
      date: '10 Jun 2026',
      amount: '₹1,200',
      weight: '0.8 kg',
      senderName: 'Sahil Gour',
      senderAddress: 'Vasamo Store, 123, Sector 5, Noida, UP - 201301',
      receiverAddress: 'Pocket D-12, Flat 45, Sector 8, Rohini, New Delhi, DL - 110085'
    },
    {
      id: 'VX001247',
      customerName: 'Amit Verma',
      destination: 'Bangalore, KA',
      courier: 'Ecom Express',
      status: 'Pending',
      date: '09 Jun 2026',
      amount: '₹890',
      weight: '2.0 kg',
      senderName: 'Sahil Gour',
      senderAddress: 'Vasamo Store, 123, Sector 5, Noida, UP - 201301',
      receiverAddress: '12th Cross, Indiranagar, Bangalore, KA - 560038'
    },
    {
      id: 'VX001248',
      customerName: 'Neha Gupta',
      destination: 'Pune, MH',
      courier: 'DTDC',
      status: 'Delivered',
      date: '09 Jun 2026',
      amount: '₹1,670',
      weight: '1.2 kg',
      senderName: 'Sahil Gour',
      senderAddress: 'Vasamo Store, 123, Sector 5, Noida, UP - 201301',
      receiverAddress: 'Flat 12, Tower B, Amanora Park Town, Hadapsar, Pune, MH - 411028'
    },
    {
      id: 'VX001249',
      customerName: 'Rohan Patel',
      destination: 'Ahmedabad, GJ',
      courier: 'XpressBees',
      status: 'In Transit',
      date: '08 Jun 2026',
      amount: '₹650',
      weight: '0.5 kg',
      senderName: 'Sahil Gour',
      senderAddress: 'Vasamo Store, 123, Sector 5, Noida, UP - 201301',
      receiverAddress: 'Shanti Sadan Apts, CG Road, Ahmedabad, GJ - 380009'
    }
  ];

  // Modal display states
  showPrintModal = signal(false);
  showManifestModal = signal(false);

  // Selected selection records
  printSelection: { [id: string]: boolean } = {};
  manifestSelection: { [id: string]: boolean } = {};

  // Selected shipment for live label preview
  selectedShipmentForPreview = signal<any>(null);

  openPrintModal(): void {
    this.shipments.forEach(s => {
      this.printSelection[s.id] = true;
    });
    if (this.shipments.length > 0) {
      this.selectedShipmentForPreview.set(this.shipments[0]);
    }
    this.showPrintModal.set(true);
  }

  closePrintModal(): void {
    this.showPrintModal.set(false);
  }

  openManifestModal(): void {
    this.shipments.forEach(s => {
      this.manifestSelection[s.id] = true;
    });
    this.showManifestModal.set(true);
  }

  closeManifestModal(): void {
    this.showManifestModal.set(false);
  }

  get today(): Date {
    return new Date();
  }

  selectPreview(shipment: any): void {
    this.selectedShipmentForPreview.set(shipment);
  }

  toggleAllPrint(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipments.forEach(s => {
      this.printSelection[s.id] = checked;
    });
  }

  isAllPrintSelected(): boolean {
    return this.shipments.every(s => this.printSelection[s.id]);
  }

  toggleAllManifest(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipments.forEach(s => {
      this.manifestSelection[s.id] = checked;
    });
  }

  isAllManifestSelected(): boolean {
    return this.shipments.every(s => this.manifestSelection[s.id]);
  }

  getSelectedPrintCount(): number {
    return this.shipments.filter(s => this.printSelection[s.id]).length;
  }

  getSelectedManifestCount(): number {
    return this.shipments.filter(s => this.manifestSelection[s.id]).length;
  }

  getSelectedManifestWeight(): number {
    return this.shipments
      .filter(s => this.manifestSelection[s.id])
      .reduce((sum, s) => sum + parseFloat(s.weight), 0);
  }

  printLabels(): void {
    const selected = this.shipments.filter(s => this.printSelection[s.id]);
    if (selected.length === 0) {
      alert('Please select at least one shipment to print labels.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print labels.');
      return;
    }

    let labelsHtml = '';
    selected.forEach(s => {
      labelsHtml += `
        <div class="label-container">
          <div class="label-header">
            <div class="courier-title">${s.courier}</div>
            <div class="awb-text">AWB: ${s.id}</div>
          </div>
          <div class="barcode-area">
            <div class="barcode-placeholder"></div>
            <div class="barcode-digits">${s.id}</div>
          </div>
          <div class="address-grid">
            <div class="address-box sender">
              <strong>SENDER:</strong>
              <div>${s.senderName}</div>
              <div>${s.senderAddress}</div>
            </div>
            <div class="address-box receiver">
              <strong>RECEIVER:</strong>
              <div>${s.customerName}</div>
              <div>${s.receiverAddress}</div>
            </div>
          </div>
          <div class="label-footer">
            <div>Date: ${s.date}</div>
            <div>Weight: ${s.weight}</div>
            <div class="amount-badge">${s.status === 'Pending' ? 'COD: ' + s.amount : 'PREPAID'}</div>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Print Shipping Labels</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8fafc;
            }
            .label-container {
              background: white;
              border: 3px solid #000;
              padding: 20px;
              width: 380px;
              margin: 0 auto 30px auto;
              box-sizing: border-box;
              page-break-inside: avoid;
              border-radius: 4px;
            }
            .label-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .courier-title {
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .awb-text {
              font-size: 14px;
              font-weight: 800;
              align-self: center;
            }
            .barcode-area {
              text-align: center;
              padding: 15px 0;
              border-bottom: 3px solid #000;
              margin-bottom: 10px;
            }
            .barcode-placeholder {
              height: 55px;
              background: repeating-linear-gradient(
                90deg,
                #000,
                #000 3px,
                #fff 3px,
                #fff 7px
              );
              margin: 0 auto;
              width: 90%;
            }
            .barcode-digits {
              font-family: monospace;
              font-size: 14px;
              margin-top: 5px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .address-grid {
              display: flex;
              flex-direction: column;
              gap: 12px;
              font-size: 12px;
              border-bottom: 3px solid #000;
              padding-bottom: 12px;
              margin-bottom: 10px;
            }
            .address-box {
              line-height: 1.4;
            }
            .address-box strong {
              display: block;
              margin-bottom: 2px;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            .label-footer {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-weight: bold;
              align-items: center;
            }
            .amount-badge {
              font-size: 13px;
              border: 1px solid #000;
              padding: 4px 8px;
              background: #000;
              color: #fff;
              border-radius: 2px;
            }
            @media print {
              body {
                background: white;
                padding: 0;
              }
              .label-container {
                margin: 0;
                page-break-after: always;
                border: 3px solid #000;
              }
            }
          </style>
        </head>
        <body>
          ${labelsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  downloadCSVManifest(): void {
    const selected = this.shipments.filter(s => this.manifestSelection[s.id]);
    if (selected.length === 0) {
      alert('Please select at least one shipment to include in the manifest.');
      return;
    }

    const headers = ['Tracking ID', 'Customer Name', 'Destination Address', 'Courier', 'Weight', 'Amount', 'Date', 'Status'];
    const rows = selected.map(s => [
      s.id,
      s.customerName,
      s.receiverAddress,
      s.courier,
      s.weight,
      s.amount,
      s.date,
      s.status
    ]);

    this.csvService.export('Vexaro_Shipping_Manifest', headers, rows);
  }

  printPDFManifest(): void {
    const selected = this.shipments.filter(s => this.manifestSelection[s.id]);
    if (selected.length === 0) {
      alert('Please select at least one shipment to include in the manifest.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print manifest.');
      return;
    }

    let rowsHtml = '';
    selected.forEach((s, idx) => {
      rowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.id}</strong></td>
          <td>${s.customerName}</td>
          <td>${s.receiverAddress}</td>
          <td>${s.courier}</td>
          <td>${s.weight}</td>
          <td>${s.amount}</td>
          <td>${s.status}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Shipping Manifest</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 30px;
              color: #333;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .header-table td {
              border: none;
              padding: 0;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .meta-info {
              text-align: right;
              font-size: 13px;
              color: #475569;
              line-height: 1.5;
            }
            .manifest-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .manifest-table th, .manifest-table td {
              border: 1px solid #cbd5e1;
              padding: 10px 12px;
              font-size: 12px;
              text-align: left;
            }
            .manifest-table th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #0f172a;
            }
            .manifest-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signature-box {
              border-top: 1px dashed #475569;
              text-align: center;
              padding-top: 10px;
              font-size: 13px;
              color: #475569;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="title">VEXARO SHIPPING MANIFEST</div>
                <div style="font-size: 14px; margin-top: 5px; color: #64748b;">Merchant handover document</div>
              </td>
              <td class="meta-info">
                <strong>Manifest ID:</strong> MN-${Date.now().toString().slice(-6)}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br>
                <strong>Merchant Name:</strong> Sahil Gour<br>
                <strong>Email:</strong> sahil@gmail.com
              </td>
            </tr>
          </table>

          <table class="manifest-table">
            <thead>
              <tr>
                <th style="width: 40px;">S.No</th>
                <th>Tracking ID</th>
                <th>Recipient</th>
                <th>Address</th>
                <th>Courier</th>
                <th>Weight</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="signatures-grid">
            <div class="signature-box" style="margin-top: 40px;">
              Merchant Representative Signature
            </div>
            <div class="signature-box" style="margin-top: 40px;">
              Courier Pickup Agent Signature & Name
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

