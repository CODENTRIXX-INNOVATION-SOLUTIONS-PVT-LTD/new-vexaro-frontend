import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispute-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-list.html',
  styleUrl: './dispute-list.css'
})
export class DisputeList implements OnInit {
  disputes: any[] = [];
  filteredDisputes: any[] = [];
  statusFilter: string = 'All';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDisputes();
  }

  loadDisputes() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/disputes
    this.disputes = [
      { id: 'DIS1001', awb: 'AWB554321', merchantName: 'Global Traders', courier: 'Delhivery Standard', status: 'Open', appliedWeight: 0.5, chargedWeight: 1.2, weightDifference: 0.7, extraChargeAmount: 150, deadlineDate: '19 Jun 2026' },
      { id: 'DIS1002', awb: 'AWB443102', merchantName: 'ABC Electronics', courier: 'Ekart Standard', status: 'Resolved', appliedWeight: 1.0, chargedWeight: 2.5, weightDifference: 1.5, extraChargeAmount: 320, deadlineDate: '15 Jun 2026' },
      { id: 'DIS1003', awb: 'AWB889012', merchantName: 'Global Traders', courier: 'Delhivery Standard', status: 'Under Review', appliedWeight: 0.5, chargedWeight: 0.8, weightDifference: 0.3, extraChargeAmount: 75, deadlineDate: '20 Jun 2026' },
    ];
    this.isLoading = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredDisputes = this.disputes.filter(d => 
      this.statusFilter === 'All' || d.status === this.statusFilter
    );
  }

  viewDispute(id: string) {
    this.router.navigate(['/distributor/disputes', id]);
  }
}
