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
    this.isLoading = false;
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
