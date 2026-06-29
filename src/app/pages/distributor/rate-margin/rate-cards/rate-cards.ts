import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RateSlab {
  courier: string;
  weightFrom: number;
  weightTo: number;
  velocityRate: number;
  distributorCost: number;
  distributorMargin: number;
  merchantRate: number;
  distributorProfit: number;
}

@Component({
  selector: 'app-rate-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-cards.html',
  styleUrl: './rate-cards.css'
})
export class RateCards implements OnInit {
  rateslabs: RateSlab[] = [];
  courierFilter: string = 'All';
  couriers: string[] = ['Delhivery', 'DTDC', 'BlueDart', 'Ekart', 'XpressBees'];
  isLoading: boolean = false;

  get filteredSlabs(): RateSlab[] {
    return this.rateslabs.filter(s => this.courierFilter === 'All' || s.courier === this.courierFilter);
  }

  ngOnInit() {
    this.loadRates();
  }

  loadRates() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/rate-cards
    // Returns: Velocity rate (hidden), Distributor cost (SA rate + SA margin), Distributor margin (set by distributor), Merchant rate
    this.rateslabs = [
      { courier: 'Delhivery', weightFrom: 0, weightTo: 0.5, velocityRate: 35, distributorCost: 40, distributorMargin: 10, merchantRate: 50, distributorProfit: 10 },
      { courier: 'Delhivery', weightFrom: 0.5, weightTo: 1.0, velocityRate: 65, distributorCost: 72, distributorMargin: 18, merchantRate: 90, distributorProfit: 18 },
      { courier: 'DTDC', weightFrom: 0, weightTo: 0.5, velocityRate: 40, distributorCost: 45, distributorMargin: 10, merchantRate: 55, distributorProfit: 10 },
      { courier: 'DTDC', weightFrom: 0.5, weightTo: 1.0, velocityRate: 70, distributorCost: 78, distributorMargin: 17, merchantRate: 95, distributorProfit: 17 },
      { courier: 'BlueDart', weightFrom: 0, weightTo: 0.5, velocityRate: 50, distributorCost: 55, distributorMargin: 15, merchantRate: 70, distributorProfit: 15 },
      { courier: 'BlueDart', weightFrom: 0.5, weightTo: 1.0, velocityRate: 85, distributorCost: 93, distributorMargin: 22, merchantRate: 115, distributorProfit: 22 },
      { courier: 'Ekart', weightFrom: 0, weightTo: 0.5, velocityRate: 38, distributorCost: 42, distributorMargin: 8, merchantRate: 50, distributorProfit: 8 },
      { courier: 'XpressBees', weightFrom: 0, weightTo: 0.5, velocityRate: 36, distributorCost: 40, distributorMargin: 10, merchantRate: 50, distributorProfit: 10 },
    ];
    this.isLoading = false;
  }
}
