import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SuperAdminDistributorReports } from './super-admin-distributor-reports/super-admin-distributor-reports';
import { SuperAdminMerchantReports } from './super-admin-merchant-report/super-admin-merchant-reports';
import { SuperAdminRevenueReports } from './super-admin-revenue-reports/super-admin-revenue-reports';
import { SuperAdminShipmentReports } from './super-admin-shipment-reports/super-admin-shipment-reports';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, SuperAdminDistributorReports, SuperAdminMerchantReports,SuperAdminRevenueReports, SuperAdminShipmentReports],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  activeTab = 'shipment-report';

}
