import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupportService } from '../../../../services/support.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  private supportService = inject(SupportService);

  tickets: any[]         = [];
  filteredTickets: any[] = [];
  isLoading  = false;
  error      = '';
  searchTerm  = '';
  statusFilter = '';

  page  = 1;
  total = 0;
  readonly limit = 20;
  get totalPages() { return Math.ceil(this.total / this.limit) || 1; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';
    const params: any = { page: this.page, limit: this.limit };
    if (this.statusFilter) params.status = this.statusFilter;

    this.supportService.listTickets(params).subscribe({
      next: (res) => {
        this.total = res?.meta?.total ?? 0;
        const raw: any[] = res?.data?.tickets ?? res?.data?.items ?? res?.data ?? [];
        this.tickets = raw.map((t: any) => ({
          id:          t._id,
          displayId:   t.ticketId ?? (t._id as string)?.slice(-6).toUpperCase(),
          subject:     t.subject ?? t.title ?? '—',
          category:    t.category ?? '—',
          priority:    t.priority ?? 'Medium',
          status:      t.status ?? 'OPEN',
          lastUpdated: t.updatedAt
            ? new Date(t.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load tickets.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.filteredTickets = this.tickets.filter(t =>
      (!q || t.subject.toLowerCase().includes(q) || t.displayId.toLowerCase().includes(q)) &&
      (!this.statusFilter || t.status === this.statusFilter)
    );
  }

  onFilterChange(): void { this.page = 1; this.load(); }

  prevPage(): void { if (this.page > 1) { this.page--; this.load(); } }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.load(); } }
}
