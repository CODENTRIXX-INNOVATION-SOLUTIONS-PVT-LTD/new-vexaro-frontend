import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../../services/finance.service';

export interface Settlement {
  id: string;
  merchantName: string;
  merchantId: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Processing';
  utr: string;
}

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settlements.html',
  styleUrl: './settlements.css'
})
export class Settlements implements OnInit {
  settlements: Settlement[] = [];
  filteredSettlements: Settlement[] = [];
  isLoading: boolean = false;
  isCreating: boolean = false;
  
  searchTerm: string = '';
  statusFilter: string = 'All';

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadSettlements();
  }

  loadSettlements() {
    this.isLoading = true;
    this.financeService.listSettlements().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.settlements) {
          this.settlements = response.data.settlements.map((s: any) => ({
            id: s.id,
            merchantName: s.merchantName || 'N/A',
            merchantId: s.merchantId,
            date: s.date || s.createdAt,
            amount: s.amount,
            status: s.status,
            utr: s.utr || '—'
          }));
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading settlements:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredSettlements = this.settlements.filter(s => {
      const matchesSearch = s.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            s.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  triggerSettlement() {
    if (confirm('Are you sure you want to create a new settlement request? This will initiate the settlement process for eligible transactions.')) {
      this.isCreating = true;
      this.financeService.createSettlement({}).subscribe({
        next: (response: any) => {
          this.isCreating = false;
          alert('Settlement request created successfully!');
          this.loadSettlements();
        },
        error: (error: any) => {
          this.isCreating = false;
          alert(error.error?.message || 'Failed to create settlement. Please try again.');
        }
      });
    }
  }
}
