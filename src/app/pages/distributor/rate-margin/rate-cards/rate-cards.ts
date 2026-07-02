import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RateService } from '../../../../services/rate.service';

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

  constructor(private rateService: RateService) {}

  ngOnInit() {
    this.loadRates();
  }

  loadRates() {
    this.isLoading = true;
    this.rateService.getRateCards().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.rateCards) {
          this.rateslabs = response.data.rateCards.map((card: any) => ({
            courier: card.courier || 'N/A',
            weightFrom: card.weightFrom || 0,
            weightTo: card.weightTo || 0,
            velocityRate: card.velocityRate || 0,
            distributorCost: card.distributorCost || 0,
            distributorMargin: card.distributorMargin || 0,
            merchantRate: card.merchantRate || 0,
            distributorProfit: card.distributorMargin || 0
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rate cards:', error);
        this.isLoading = false;
      }
    });
  }
}
