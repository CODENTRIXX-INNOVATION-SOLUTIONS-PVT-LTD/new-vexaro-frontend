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

  // ── Stats cards (template binds [cards]="stats") ──────────────────────────
  stats = [
    { title: 'Open Tickets',  value: 0, icon: 'fas fa-ticket-alt',  bgColor: '#E3F2FD', iconColor: '#1976D2' },
    { title: 'Resolved',      value: 0, icon: 'fas fa-check-circle', bgColor: '#E8F5E9', iconColor: '#2E7D32' },
    { title: 'In Progress',   value: 0, icon: 'fas fa-clock',        bgColor: '#FFF3E0', iconColor: '#F57C00' },
    { title: 'Total',         value: 0, icon: 'fas fa-list',          bgColor: '#F3E5F5', iconColor: '#7B1FA2' },
  ];

  // ── Ticket list ───────────────────────────────────────────────────────────
  tickets: any[] = [];
  isLoading      = false;
  listError      = '';

  // ── Accordion ─────────────────────────────────────────────────────────────
  openSections: Set<string> = new Set();

  // ── Create ticket ─────────────────────────────────────────────────────────
  ticketCategories = ['Order Issue', 'Shipment Issue', 'Payment Issue', 'Return Issue', 'Other'];
  priorities       = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  selectedCategory = 'Order Issue';
  ticketSubject    = '';
  ticketDescription = '';
  selectedPriority  = 'MEDIUM';
  isSubmitting      = false;
  ticketSubmitted   = false;
  createError       = '';

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faqs = [
    'How do I track my shipment?', 'What is the return policy window?',
    'How long does a refund take?', 'What should I do if a payment fails?',
    'Can I cancel an order after dispatch?',
  ];

  // ── Issue card groups (template iterates these) ──────────────────────────
  orderIssues = [
    { title: 'Order Not Received',    description: 'Customer reported order has not arrived.' },
    { title: 'Wrong Item Delivered',  description: 'Incorrect product was delivered.' },
    { title: 'Order Damaged',         description: 'Item received in damaged condition.' },
    { title: 'Order Cancelled',       description: 'Help with order cancellation refund.' },
  ];

  shipmentIssues = [
    { title: 'Shipment Delayed',      description: 'Delivery is taking longer than expected.' },
    { title: 'Lost in Transit',       description: 'No tracking update for over 3 days.' },
    { title: 'Delivered to Wrong Address', description: 'Package delivered to incorrect location.' },
    { title: 'RTO Initiated Wrongly', description: 'Return triggered without delivery attempt.' },
  ];

  paymentIssues = [
    { title: 'COD Amount Not Remitted', description: 'Cash collected but not credited to wallet.' },
    { title: 'Wallet Deduction Error',  description: 'Incorrect amount deducted from wallet.' },
    { title: 'Refund Not Received',     description: 'Refund for cancelled shipment pending.' },
    { title: 'Weight Dispute Charge',   description: 'Incorrect weight-based extra charge.' },
  ];

  returnReasons = [
    { title: 'Return Not Picked Up',   description: 'Reverse pickup not attempted.' },
    { title: 'Refund for Return',      description: 'Refund not processed for returned item.' },
    { title: 'Wrong Return Address',   description: 'Return shipment going to wrong warehouse.' },
  ];

  productIssues = [
    { title: 'Listing Issue',          description: 'Product catalogue or listing problem.' },
    { title: 'Inventory Mismatch',     description: 'Stock count does not match records.' },
    { title: 'Product Damaged',        description: 'Product damaged in warehouse or transit.' },
  ];

  ngOnInit(): void { this.loadTickets(); }

  loadTickets(): void {
    this.isLoading = true;
    this.listError = '';
    this.supportService.listTickets({ page: 1, limit: 50 }).pipe(
      finalize(() => { this.isLoading = false; }),
    ).subscribe({
      next: (res) => {
        const raw: any[] = res?.data?.tickets ?? res?.data?.items ?? [];
        this.tickets = raw.map(t => ({
          ticketId: t.ticketId ?? `#${(t._id as string)?.slice(-6).toUpperCase()}`,
          id:       t._id,
          category: t.category,
          subject:  t.subject ?? t.title ?? '—',
          priority: t.priority ?? 'MEDIUM',
          status:   t.status   ?? 'OPEN',
        }));
        this.updateStats(res?.meta?.total ?? this.tickets.length);
      },
      error: (err) => { this.listError = err?.error?.message || 'Failed to load tickets.'; },
    });
  }

  private updateStats(total: number): void {
    this.stats[0].value = this.tickets.filter(t => t.status === 'OPEN').length;
    this.stats[1].value = this.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    this.stats[2].value = this.tickets.filter(t => t.status === 'IN_PROGRESS').length;
    this.stats[3].value = total;
  }

  toggleSection(s: string): void {
    this.openSections.has(s) ? this.openSections.delete(s) : this.openSections.add(s);
  }
  isOpen(s: string): boolean { return this.openSections.has(s); }

  raiseTicket(category: string, subject: string): void {
    this.selectedCategory  = category;
    this.ticketSubject     = subject;
    this.ticketDescription = '';
    this.openSections.add('create-ticket');
    setTimeout(() => {
      document.getElementById('create-ticket-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketDescription.trim()) {
      this.createError = 'Subject and description are required.';
      return;
    }
    this.isSubmitting = true;
    this.createError  = '';

    this.supportService.createTicket({
      subject:     this.ticketSubject.trim(),
      category:    this.selectedCategory,
      priority:    this.selectedPriority,
      description: this.ticketDescription.trim(),
    }).pipe(finalize(() => { this.isSubmitting = false; })).subscribe({
      next: () => {
        this.ticketSubmitted   = true;
        this.ticketSubject     = '';
        this.ticketDescription = '';
        this.loadTickets();
        setTimeout(() => { this.ticketSubmitted = false; }, 3000);
      },
      error: (err) => { this.createError = err?.error?.message || 'Failed to create ticket.'; },
    });
  }

  getStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'RESOLVED': case 'CLOSED':  return 'badge badge-resolved';
      case 'IN_PROGRESS':              return 'badge badge-pending';
      case 'OPEN':                     return 'badge badge-open';
      default:                         return 'badge';
    }
  }
}
