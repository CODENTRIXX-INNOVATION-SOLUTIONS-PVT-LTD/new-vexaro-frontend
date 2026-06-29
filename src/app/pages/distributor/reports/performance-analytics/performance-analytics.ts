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
    this.summary = {
      revenue: 545000,
      profitMargin: '9%',
      activeMerchants: 10,
      merchantGrowth: '+12%'
    };
    this.dataList = [
      { name: 'Average Pickup Time', value: '2.4 Hours', rating: 'Excellent', ratingClass: 'text-success' },
      { name: 'Average Delivery Time', value: '2.8 Days', rating: 'Good', ratingClass: 'text-primary' },
      { name: 'RTO Rate', value: '4.2%', rating: 'Very Low', ratingClass: 'text-success' },
      { name: 'Customer Satisfaction', value: '4.8 / 5', rating: 'Excellent', ratingClass: 'text-success' },
      { name: 'Dispute Resolution Rate', value: '96%', rating: 'Excellent', ratingClass: 'text-success' },
    ];
    this.isLoading = false;
  }

  exportCSV() { alert('Downloading CSV...'); }
  exportPDF() { alert('Downloading PDF Report...'); }
}
