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
    this.isLoading = false;
  }

  exportCSV() { alert('Downloading CSV...'); }
  exportPDF() { alert('Downloading PDF Report...'); }
}
