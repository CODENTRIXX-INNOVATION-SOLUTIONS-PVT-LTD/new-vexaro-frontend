import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../services/support.service';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-merchant-support',
  standalone: true,
  imports: [CommonModule, FormsModule, StatsCards],
  templateUrl: './merchant-support.html',
  styleUrls: ['./merchant-support.css'],
})
export class MerchantSupport implements OnInit {
  private supportService = inject(SupportService);

  stats = [
    { title: 'Open Tickets', value: 0, icon: 'fas fa-ticket-alt', bgColor: '#E3F2FD', iconColor: '#1976D2' },
    { title: 'Resolved', value: 0, icon: 'fas fa-check-circle', bgColor: '#E8F5E9', iconColor: '#2E7D32' },
    { title: 'In Progress', value: 0, icon: 'fas fa-clock', bgColor: '#FFF3E0', iconColor: '#F57C00' },
    { title: 'Total', value: 0, icon: 'fas fa-list', bgColor: '#F3E5F5', iconColor: '#7B1FA2' },
  ];

  tickets: any[] = [];
  isLoading = false;
  listError = '';

  selectedTicket: any = null;
  isTicketLoading = false;
  detailError = '';
  replyText = '';
  isReplying = false;
  replyError = '';

  openSections: Set<string> = new Set(['my-tickets']);

  ticketCategories = [
    { label: 'Shipment', value: 'SHIPMENT' },
    { label: 'Account', value: 'ACCOUNT' },
    { label: 'Technical', value: 'TECHNICAL' },
    { label: 'Other', value: 'OTHER' },
  ];
  priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  selectedCategory = 'SHIPMENT';
  ticketSubject = '';
  ticketDescription = '';
  selectedPriority = 'MEDIUM';
  isSubmitting = false;
  ticketSubmitted = false;
  createError = '';

  faqs = [
    'How do I track my shipment?',
    'What should I do if pickup is delayed?',
    'How do I download a shipping label?',
    'Can I cancel a shipment after booking?',
  ];

  shipmentIssues = [
    { title: 'Shipment Delayed', description: 'Delivery is taking longer than expected.' },
    { title: 'Lost in Transit', description: 'No tracking update for over 3 days.' },
    { title: 'Delivered to Wrong Address', description: 'Package delivered to incorrect location.' },
    { title: 'RTO Initiated Wrongly', description: 'Return triggered without delivery attempt.' },
  ];

  returnReasons = [
    { title: 'Return Not Picked Up', description: 'Reverse pickup not attempted.' },
    { title: 'Wrong Return Address', description: 'Return shipment going to wrong warehouse.' },
  ];

  productIssues = [
    { title: 'Listing Issue', description: 'Product catalogue or listing problem.' },
    { title: 'Inventory Mismatch', description: 'Stock count does not match records.' },
    { title: 'Product Damaged', description: 'Product damaged in warehouse or transit.' },
  ];

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.listError = '';
    this.supportService.listTickets({ page: 1, limit: 50 }).pipe(
      finalize(() => { this.isLoading = false; }),
    ).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.tickets ?? res?.data?.items ?? [];
        this.tickets = raw.map((ticket) => ({
          ticketId: ticket.ticketNumber ?? `#${String(ticket._id || '').slice(-6).toUpperCase()}`,
          id: ticket._id,
          category: ticket.category,
          subject: ticket.subject ?? ticket.title ?? '-',
          priority: ticket.priority ?? 'MEDIUM',
          status: ticket.status ?? 'OPEN',
          createdAt: ticket.createdAt,
        }));
        this.updateStats(res?.meta?.total ?? this.tickets.length);
      },
      error: (err) => {
        this.listError = err?.error?.message || 'Failed to load tickets.';
      },
    });
  }

  private updateStats(total: number): void {
    this.stats[0].value = this.tickets.filter((ticket) => ticket.status === 'OPEN').length;
    this.stats[1].value = this.tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length;
    this.stats[2].value = this.tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
    this.stats[3].value = total;
  }

  toggleSection(section: string): void {
    this.openSections.has(section) ? this.openSections.delete(section) : this.openSections.add(section);
  }

  isOpen(section: string): boolean {
    return this.openSections.has(section);
  }

  raiseTicket(category: string, subject: string): void {
    this.selectedCategory = category;
    this.ticketSubject = subject;
    this.ticketDescription = '';
    this.openSections.add('create-ticket');
    setTimeout(() => {
      document.getElementById('create-ticket-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  submitTicket(): void {
    const subject = this.ticketSubject.trim();
    const description = this.ticketDescription.trim();
    if (subject.length < 5) {
      this.createError = 'Subject must be at least 5 characters.';
      return;
    }
    if (description.length < 20) {
      this.createError = 'Description must be at least 20 characters.';
      return;
    }

    this.isSubmitting = true;
    this.createError = '';
    this.ticketSubmitted = false;

    this.supportService.createTicket({
      subject,
      category: this.selectedCategory,
      priority: this.selectedPriority,
      description,
    }).pipe(finalize(() => { this.isSubmitting = false; })).subscribe({
      next: () => {
        this.ticketSubmitted = true;
        this.ticketSubject = '';
        this.ticketDescription = '';
        this.openSections.add('my-tickets');
        this.loadTickets();
        setTimeout(() => { this.ticketSubmitted = false; }, 3000);
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Failed to create ticket.';
      },
    });
  }

  openTicket(ticket: any): void {
    if (!ticket?.id) return;
    this.isTicketLoading = true;
    this.detailError = '';
    this.replyError = '';
    this.replyText = '';

    this.supportService.getTicketById(ticket.id).pipe(
      finalize(() => { this.isTicketLoading = false; }),
    ).subscribe({
      next: (res) => {
        this.selectedTicket = this.mapTicketDetail(res?.data ?? res);
      },
      error: (err) => {
        this.detailError = err?.error?.message || 'Failed to load ticket details.';
      },
    });
  }

  closeTicketDetail(): void {
    this.selectedTicket = null;
    this.detailError = '';
    this.replyError = '';
    this.replyText = '';
  }

  submitReply(): void {
    const message = this.replyText.trim();
    if (!this.selectedTicket?.id || !message) return;
    if (message.length < 2) {
      this.replyError = 'Reply must contain at least 2 characters.';
      return;
    }

    this.isReplying = true;
    this.replyError = '';

    this.supportService.addReply(this.selectedTicket.id, message).pipe(
      finalize(() => { this.isReplying = false; }),
    ).subscribe({
      next: () => {
        const id = this.selectedTicket.id;
        this.replyText = '';
        this.openTicket({ id });
        this.loadTickets();
      },
      error: (err) => {
        this.replyError = err?.error?.message || 'Failed to post reply.';
      },
    });
  }

  canReply(ticket = this.selectedTicket): boolean {
    const status = String(ticket?.status || '').toUpperCase();
    return Boolean(ticket?.id && !['RESOLVED', 'CLOSED'].includes(status));
  }

  getStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'badge badge-resolved';
      case 'IN_PROGRESS':
        return 'badge badge-pending';
      case 'OPEN':
        return 'badge badge-open';
      default:
        return 'badge';
    }
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private mapTicketDetail(ticket: any): any {
    return {
      id: ticket._id,
      ticketNumber: ticket.ticketNumber ?? `#${String(ticket._id || '').slice(-6).toUpperCase()}`,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      subject: ticket.subject,
      description: ticket.description,
      createdAt: ticket.createdAt,
      assignedTo: ticket.assignedTo
        ? `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`.trim() || ticket.assignedTo.email
        : 'Awaiting assignment',
      replies: (ticket.replies || []).map((reply: any) => ({
        id: reply._id,
        message: reply.message,
        createdAt: reply.createdAt,
        isStaff: Boolean(reply.isStaff),
        author: reply.author
          ? `${reply.author.firstName || ''} ${reply.author.lastName || ''}`.trim() || reply.author.role || 'Support'
          : 'Support',
      })),
    };
  }
}
