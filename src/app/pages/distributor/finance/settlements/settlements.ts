import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  searchTerm: string = '';
  statusFilter: string = 'All';

  ngOnInit() {
    this.loadSettlements();
  }

  loadSettlements() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/settlements
    this.settlements = [
      { id: 'SET1001', merchantName: 'ABC Electronics', merchantId: 'M1', date: '16 Jun 2026', amount: 8500, status: 'Completed', utr: 'UTR992810' },
      { id: 'SET1002', merchantName: 'Global Traders', merchantId: 'M2', date: '17 Jun 2026', amount: 12000, status: 'Processing', utr: '—' },
      { id: 'SET1003', merchantName: 'Prime Retail', merchantId: 'M3', date: '14 Jun 2026', amount: 4500, status: 'Completed', utr: 'UTR887102' }
    ];
    this.isLoading = false;
    this.applyFilters();
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
    // TODO: Open modal to select merchant and amount to settle
    alert('Opening Manual Settlement Dialog...');
  }
}
