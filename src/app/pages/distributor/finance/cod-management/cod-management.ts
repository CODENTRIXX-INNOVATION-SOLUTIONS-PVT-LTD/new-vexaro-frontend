import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CODRecord {
  awb: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  status: 'Pending Remittance' | 'Remitted' | 'Returned';
  date: string;
}

@Component({
  selector: 'app-cod-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cod-management.html',
  styleUrl: './cod-management.css'
})
export class CodManagement implements OnInit {
  records: CODRecord[] = [];
  filteredRecords: CODRecord[] = [];
  isLoading: boolean = false;
  
  searchTerm: string = '';
  statusFilter: string = 'All';

  summary = {
    pending: 0,
    remitted: 0,
    returned: 0
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/cod-remittances
    this.records = [
      { awb: 'AWB889012', merchantName: 'Global Traders', merchantId: 'M2', amount: 2500, status: 'Pending Remittance', date: '17 Jun 2026' },
      { awb: 'AWB661122', merchantName: 'Prime Retail', merchantId: 'M3', amount: 1800, status: 'Remitted', date: '15 Jun 2026' },
      { awb: 'AWB554321', merchantName: 'Global Traders', merchantId: 'M2', amount: 320, status: 'Pending Remittance', date: '14 Jun 2026' },
      { awb: 'AWB334211', merchantName: 'ABC Electronics', merchantId: 'M1', amount: 1200, status: 'Remitted', date: '12 Jun 2026' },
    ];
    this.summary = {
      pending: 2820,
      remitted: 3000,
      returned: 0
    };
    this.isLoading = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredRecords = this.records.filter(r => {
      const matchesSearch = r.awb.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            r.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || r.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  markAsRemitted(awb: string) {
    if(confirm(`Mark AWB ${awb} COD as Remitted to Merchant?`)) {
      // TODO: POST /distributor/cod-remittances/remit { awb }
      alert(`${awb} marked as Remitted.`);
    }
  }
}
