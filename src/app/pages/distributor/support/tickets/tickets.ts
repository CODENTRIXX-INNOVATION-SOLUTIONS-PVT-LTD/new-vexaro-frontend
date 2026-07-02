import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupportService } from '../../../../services/support.service';

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
  isLoading: boolean = false;

  constructor(private supportService: SupportService) {}

  ngOnInit() {
    this.loadTickets();
    this.applyFilters();
  }

  loadTickets() {
    this.isLoading = true;
    this.supportService.getTickets().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.tickets) {
          this.tickets = response.data.tickets.map((t: any) => ({
            id: t.id,
            subject: t.subject || 'N/A',
            category: t.category || 'General',
            priority: t.priority || 'Medium',
            status: t.status,
            lastUpdated: t.updatedAt || t.lastUpdated || 'N/A'
          }));
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error loading tickets:', error);
        this.isLoading = false;
      }
    });
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
