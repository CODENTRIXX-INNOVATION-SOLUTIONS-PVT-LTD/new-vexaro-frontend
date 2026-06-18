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
