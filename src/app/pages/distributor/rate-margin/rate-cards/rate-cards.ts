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
    this.isLoading = false;
  }
}
