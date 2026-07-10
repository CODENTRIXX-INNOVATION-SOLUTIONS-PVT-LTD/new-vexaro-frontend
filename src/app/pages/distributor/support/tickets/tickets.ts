import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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

  selectedTicket: any = null;
  isDetailLoading = false;
  isUpdating = false;
  detailError = '';
  replyText = '';

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
          displayId:   t.ticketNumber ?? t.ticketId ?? (t._id as string)?.slice(-6).toUpperCase(),
          subject:     t.subject ?? t.title ?? '—',
          category:    t.category ?? '—',
          priority:    t.priority ?? 'Medium',
          status:      t.status ?? 'OPEN',
          lastUpdated: t.updatedAt
            ? new Date(t.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

  openTicket(ticket: any): void {
    if (!ticket?.id) return;
    this.isDetailLoading = true;
    this.detailError = '';
    this.replyText = '';
    this.supportService.getTicketById(ticket.id)
      .pipe(finalize(() => { this.isDetailLoading = false; }))
      .subscribe({
        next: (res) => {
          this.selectedTicket = this.mapTicketDetail(res?.data ?? res);
        },
        error: (err) => {
          this.detailError = err?.error?.message || 'Failed to load ticket.';
        },
      });
  }

  closeDetail(): void {
    this.selectedTicket = null;
    this.detailError = '';
    this.replyText = '';
  }

  updateStatus(status: string): void {
    if (!this.selectedTicket?.id) return;
    this.isUpdating = true;
    this.detailError = '';
    this.supportService.updateTicket(this.selectedTicket.id, { status })
      .pipe(finalize(() => { this.isUpdating = false; }))
      .subscribe({
        next: (res) => {
          this.selectedTicket = this.mapTicketDetail(res?.data ?? res);
          this.load();
        },
        error: (err) => {
          this.detailError = err?.error?.message || 'Failed to update ticket.';
        },
      });
  }

  submitReply(): void {
    const message = this.replyText.trim();
    if (!this.selectedTicket?.id || !message) return;

    this.isUpdating = true;
    this.detailError = '';
    this.supportService.addReply(this.selectedTicket.id, message)
      .pipe(finalize(() => { this.isUpdating = false; }))
      .subscribe({
        next: (res) => {
          this.replyText = '';
          this.selectedTicket = this.mapTicketDetail(res?.data ?? res);
          this.load();
        },
        error: (err) => {
          this.detailError = err?.error?.message || 'Failed to post reply.';
        },
      });
  }

  canReply(): boolean {
    const status = String(this.selectedTicket?.status || '').toUpperCase();
    return Boolean(this.selectedTicket?.id && !['RESOLVED', 'CLOSED'].includes(status));
  }

  private mapTicketDetail(ticket: any): any {
    return {
      id: ticket._id,
      displayId: ticket.ticketNumber ?? (ticket._id as string)?.slice(-6).toUpperCase(),
      subject: ticket.subject ?? '-',
      description: ticket.description ?? '-',
      category: ticket.category ?? '-',
      priority: ticket.priority ?? 'MEDIUM',
      status: ticket.status ?? 'OPEN',
      raisedBy: ticket.raisedBy ? `${ticket.raisedBy.firstName || ''} ${ticket.raisedBy.lastName || ''}`.trim() || ticket.raisedBy.email : '-',
      assignedTo: ticket.assignedTo ? `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`.trim() || ticket.assignedTo.email : '-',
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      replies: (ticket.replies || []).map((reply: any) => ({
        author: reply.author?.role === 'MERCHANT' ? 'Merchant'
          : reply.author?.role === 'DISTRIBUTOR' ? 'Distributor'
          : reply.author?.role === 'SUPER_ADMIN' ? 'Super Admin'
          : 'User',
        message: reply.message || '',
        createdAt: reply.createdAt,
      })),
    };
  }
}
