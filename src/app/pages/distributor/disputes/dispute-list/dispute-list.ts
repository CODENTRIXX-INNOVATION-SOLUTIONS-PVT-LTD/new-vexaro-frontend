import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisputeService } from '../../../../services/dispute.service';

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

  constructor(private router: Router, private disputeService: DisputeService) {}

  ngOnInit() {
    this.loadDisputes();
  }

  loadDisputes() {
    this.isLoading = true;
    this.disputeService.listWeightDisputes().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.disputes) {
          this.disputes = response.data.disputes.map((d: any) => ({
            id: d.id,
            awb: d.awb || 'N/A',
            merchantName: d.merchantName || 'N/A',
            courier: d.courier || 'N/A',
            status: d.status,
            appliedWeight: d.appliedWeight || 0,
            chargedWeight: d.chargedWeight || 0,
            weightDifference: d.weightDifference || 0,
            extraChargeAmount: d.extraChargeAmount || 0,
            deadlineDate: d.deadlineDate || 'N/A'
          }));
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading disputes:', error);
        this.isLoading = false;
      }
    });
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
