import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-profit-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profit-view.html',
  styleUrl: './profit-view.css'
})
export class ProfitView implements OnInit {
  profitSummary = {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    marginPercentage: 0
  };

  courierProfits: any[] = [];
  merchantProfits: any[] = [];
  isLoading: boolean = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.reportsService.getRevenueReport().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profitSummary = {
            totalRevenue: response.data.totalRevenue || 0,
            totalCost: response.data.totalCost || 0,
            totalProfit: response.data.totalProfit || 0,
            marginPercentage: response.data.marginPercentage || 0
          };
          this.courierProfits = response.data.courierProfits || [];
          this.merchantProfits = response.data.merchantProfits || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profit data:', error);
        this.isLoading = false;
      }
    });
  }
}
