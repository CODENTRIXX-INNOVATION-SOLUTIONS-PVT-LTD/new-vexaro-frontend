import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-analytics.html',
  styleUrl: './performance-analytics.css'
})
export class PerformanceAnalytics implements OnInit {
  dateRange: string = 'This Month';
  merchantFilter: string = 'All Merchants';
  isLoading: boolean = false;

  summary = {
    revenue: 0,
    profitMargin: '0%',
    activeMerchants: 0,
    merchantGrowth: '+0%'
  };

  dataList: any[] = [];

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/reports/performance
    this.isLoading = false;
  }

  exportCSV() { alert('Downloading CSV...'); }
  exportPDF() { alert('Downloading PDF Report...'); }
}
