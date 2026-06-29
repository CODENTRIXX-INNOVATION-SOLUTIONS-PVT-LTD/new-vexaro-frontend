import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipment-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-reports.html',
  styleUrl: './shipment-reports.css'
})
export class ShipmentReports implements OnInit {
  dateRange: string = 'This Month';
  merchantFilter: string = 'All Merchants';
  isLoading: boolean = false;

  summary = {
    total: 0,
    delivered: 0,
    failed: 0,
    rto: 0
  };

  dataList: any[] = [];

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/reports/shipments
    this.summary = {
      total: 890,
      delivered: 812,
      failed: 43,
      rto: 35
    };
    this.dataList = [
      { date: '17 Jun 2026', total: 48, delivered: 42, failed: 4, rto: 2, codCollected: 45000 },
      { date: '16 Jun 2026', total: 55, delivered: 50, failed: 3, rto: 2, codCollected: 38000 },
      { date: '15 Jun 2026', total: 60, delivered: 55, failed: 3, rto: 2, codCollected: 52000 },
      { date: '14 Jun 2026', total: 42, delivered: 38, failed: 2, rto: 2, codCollected: 29000 },
      { date: '13 Jun 2026', total: 38, delivered: 35, failed: 2, rto: 1, codCollected: 18000 },
    ];
    this.isLoading = false;
  }

  exportCSV() { alert('Downloading CSV...'); }
  exportPDF() { alert('Downloading PDF Report...'); }
}
