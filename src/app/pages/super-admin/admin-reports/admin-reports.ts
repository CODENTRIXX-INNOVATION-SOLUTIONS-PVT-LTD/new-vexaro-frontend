import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SuperAdminDistributorReports } from './super-admin-distributor-reports/super-admin-distributor-reports';
import { SuperAdminMerchantReports } from './super-admin-merchant-report/super-admin-merchant-reports';
import { SuperAdminRevenueReports } from './super-admin-revenue-reports/super-admin-revenue-reports';
import { SuperAdminShipmentReports } from './super-admin-shipment-reports/super-admin-shipment-reports';
import { ReportsService } from '../../../services/reports.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, SuperAdminDistributorReports, SuperAdminMerchantReports,SuperAdminRevenueReports, SuperAdminShipmentReports],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports implements OnInit {
  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);
  
  activeTab = 'shipment-report';
  isLoading = false;

  // Summary Cards
  totalShipments = 0;
  totalRevenue = '₹0';
  totalMerchants = 0;
  totalDistributors = 0;

  ngOnInit() {
    this.loadReportsOverview();
  }

  loadReportsOverview() {
    this.isLoading = true;
    this.reportsService.getReportsOverview().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.totalShipments = res.data.totalShipments || 0;
          this.totalRevenue = res.data.totalRevenue ? '₹' + (res.data.totalRevenue / 10000000).toFixed(1) + ' Cr' : '₹0';
          this.totalMerchants = res.data.totalMerchants || 0;
          this.totalDistributors = res.data.totalDistributors || 0;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reports overview:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
