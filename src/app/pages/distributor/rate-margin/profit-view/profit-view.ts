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
    this.profitSummary = {
      totalRevenue: 545000,
      totalCost: 500000,
      totalProfit: 45000,
      marginPercentage: 9.0
    };
    this.courierProfits = [
      { name: 'Delhivery', shipments: 450, revenue: 225000, cost: 200000, profit: 25000 },
      { name: 'DTDC', shipments: 320, revenue: 160000, cost: 148000, profit: 12000 },
      { name: 'BlueDart', shipments: 80, revenue: 56000, cost: 50000, profit: 6000 },
      { name: 'Ekart', shipments: 40, revenue: 20000, cost: 18000, profit: 2000 },
    ];
    this.merchantProfits = [
      { name: 'ABC Electronics', shipments: 380, revenue: 190000, cost: 172000, profit: 18000 },
      { name: 'Global Traders', shipments: 450, revenue: 320000, cost: 295000, profit: 25000 },
      { name: 'Prime Retail', shipments: 60, revenue: 35000, cost: 33000, profit: 2000 },
    ];
    this.isLoading = false;
  }
}
