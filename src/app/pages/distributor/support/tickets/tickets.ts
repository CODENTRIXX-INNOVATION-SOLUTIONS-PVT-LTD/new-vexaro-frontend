import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdated: string;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  
  searchTerm: string = '';
  statusFilter: string = 'All';

  ngOnInit() {
    this.loadDummyData();
    this.applyFilters();
  }

  loadDummyData() {
    this.tickets = [
      { id: 'TKT-1001', subject: 'Driver app login issue', category: 'Technical', priority: 'High', status: 'Open', lastUpdated: 'Today, 10:30 AM' },
      { id: 'TKT-1002', subject: 'Dispute regarding Settlement SETTL-004', category: 'Finance', priority: 'Medium', status: 'In Progress', lastUpdated: 'Yesterday, 04:15 PM' },
      { id: 'TKT-1003', subject: 'Requesting extra barcode scanners', category: 'Hardware', priority: 'Low', status: 'Resolved', lastUpdated: '14 Jun 2026' },
      { id: 'TKT-1004', subject: 'Delay in Hub pickup assignment', category: 'Operations', priority: 'High', status: 'Closed', lastUpdated: '12 Jun 2026' }
    ];
  }

  applyFilters() {
    this.filteredTickets = this.tickets.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            t.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || t.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
}
