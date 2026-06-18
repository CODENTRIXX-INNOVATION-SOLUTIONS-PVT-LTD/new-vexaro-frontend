import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/profit-summary
    this.isLoading = false;
  }
}
