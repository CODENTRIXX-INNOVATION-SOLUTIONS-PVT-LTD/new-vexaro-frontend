import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  standalone: true,
  selector: 'app-distributor-performance',
  imports: [],
  templateUrl: './distributor-performance.html',
  styleUrls: ['../../../../common-css/super-admin-distrubutore-tabs.css']
})
export class DistributorPerformance implements OnInit {
  stats = {
    totalShipments: 0,
    completedShipments: 0,
    activeMerchants: 0,
    assignedWarehouses: 0,
    monthlyRevenue: 0,
  };

  isLoading = false;
  error = '';

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.loadPerformance();
  }

  private loadPerformance(): void {
    this.isLoading = true;
    this.error = '';

    this.reportsService.getDistributorPerformance().subscribe({
      next: (res) => {
        this.stats = {
          totalShipments: res.data?.totalShipments ?? 0,
          completedShipments: res.data?.completedShipments ?? 0,
          activeMerchants: res.data?.activeMerchants ?? 0,
          assignedWarehouses: res.data?.assignedWarehouses ?? 0,
          monthlyRevenue: res.data?.monthlyRevenue ?? 0,
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load distributor performance.';
        this.isLoading = false;
      }
    });
  }
}
