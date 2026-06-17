import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../components/stats-cards/stats-cards';

interface Stat {
  title: string;
  count: number;
}

interface Issue {
  title: string;
  description: string;
}

interface Ticket {
  ticketId: string;
  category: string;
  subject: string;
  priority: string;
  status: string;
}

@Component({
  selector: 'app-merchant-support',
  standalone: true,
  imports: [CommonModule, FormsModule, StatsCards],
  templateUrl: './merchant-support.html',
  styleUrls: ['./merchant-support.css']
})
export class MerchantSupport {

  openSections: Set<string> = new Set();

stats = [
  {
    title: 'Open Tickets',
    value: 4,
    icon: 'fas fa-ticket-alt',
    bgColor: '#E3F2FD',
    iconColor: '#1976D2'
  },
  {
    title: 'Resolved',
    value: 12,
    icon: 'fas fa-check-circle',
    bgColor: '#E8F5E9',
    iconColor: '#2E7D32'
  },
  {
    title: 'Pending',
    value: 2,
    icon: 'fas fa-clock',
    bgColor: '#FFF3E0',
    iconColor: '#F57C00'
  },
  {
    title: 'Total',
    value: 18,
    icon: 'fas fa-list',
    bgColor: '#F3E5F5',
    iconColor: '#7B1FA2'
  }
];

  ticketCategories: string[] = [
    'Order Issue',
    'Shipment Issue',
    'Payment Issue',
    'Return Issue',
    'Product Issue',
    'Other'
  ];

  priorities: string[] = ['Low', 'Medium', 'High', 'Critical'];

  selectedCategory: string = 'Order Issue';
  ticketSubject: string = '';
  ticketDescription: string = '';
  selectedPriority: string = 'Low';
  ticketSubmitted: boolean = false;

  tickets: Ticket[] = [
    { ticketId: '#TK-001', category: 'Order Issue', subject: 'Missing item in order', priority: 'High', status: 'Resolved' },
    { ticketId: '#TK-002', category: 'Shipment Issue', subject: 'Delivery delay', priority: 'Medium', status: 'Pending' },
    { ticketId: '#TK-003', category: 'Payment Issue', subject: 'Refund not received', priority: 'High', status: 'Resolved' },
    { ticketId: '#TK-004', category: 'Return Issue', subject: 'Return pickup not scheduled', priority: 'Low', status: 'Open' }
  ];

  orderIssues: Issue[] = [
    { title: 'Missing item', description: 'Item was not included in the delivered package.' },
    { title: 'Wrong item delivered', description: 'Received a different item than what was ordered.' },
    { title: 'Order cancellation', description: 'Need to cancel an order that has already been placed.' },
    { title: 'Duplicate order', description: 'Accidentally placed the same order more than once.' }
  ];

  shipmentIssues: Issue[] = [
    { title: 'Shipment not tracking', description: 'Tracking number is not updating or showing any movement.' },
    { title: 'Carrier delay', description: 'Package delayed beyond the estimated delivery window.' },
    { title: 'Lost in transit', description: 'Package has not arrived and tracking shows no updates.' },
    { title: 'Wrong address', description: 'Shipment dispatched to an incorrect delivery address.' }
  ];

  paymentIssues: Issue[] = [
    { title: 'Refund not received', description: 'Refund was initiated but not credited to your account.' },
    { title: 'Double charged', description: 'Amount was deducted more than once for the same order.' },
    { title: 'Payment failure', description: 'Transaction failed even though the amount was debited.' },
    { title: 'Invoice mismatch', description: 'Invoice amount does not match the actual order value.' }
  ];

  returnReasons: Issue[] = [
    { title: 'Initiate return', description: 'Request a return for a delivered order within policy window.' },
    { title: 'Damaged item', description: 'Received item is damaged or defective on delivery.' },
    { title: 'Return pickup pending', description: 'Return was scheduled but pickup has not happened yet.' },
    { title: 'Refund after return', description: 'Item was returned but refund has not been processed.' }
  ];

  productIssues: Issue[] = [
    { title: 'Listing not visible', description: 'Product listing is not showing up in search results.' },
    { title: 'Stock mismatch', description: 'Inventory count on platform does not match actual stock.' },
    { title: 'Price not updating', description: 'Updated price is not reflecting on the product page.' },
    { title: 'Image upload error', description: 'Product images are failing to upload or not displaying.' }
  ];

  faqs: string[] = [
    'How do I track my shipment?',
    'What is the return policy window?',
    'How long does a refund take to process?',
    'How do I update my product listing?',
    'What should I do if a payment fails?',
    'Can I cancel an order after dispatch?'
  ];

  toggleSection(section: string): void {
    if (this.openSections.has(section)) {
      this.openSections.delete(section);
    } else {
      this.openSections.add(section);
    }
  }

  isOpen(section: string): boolean {
    return this.openSections.has(section);
  }

  raiseTicket(category: string, subject: string): void {
    this.selectedCategory = category;
    this.ticketSubject = subject;
    this.ticketDescription = '';
    this.selectedPriority = 'Low';
    this.openSections.add('create-ticket');

    setTimeout(() => {
      const el = document.getElementById('create-ticket-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim()) return;

    const newTicket: Ticket = {
      ticketId: `#TK-00${this.tickets.length + 1}`,
      category: this.selectedCategory,
      subject: this.ticketSubject,
      priority: this.selectedPriority,
      status: 'Open'
    };

    this.tickets.push(newTicket);
    this.ticketSubmitted = true;
    this.ticketSubject = '';
    this.ticketDescription = '';
    this.selectedPriority = 'Low';

    setTimeout(() => {
      this.ticketSubmitted = false;
    }, 3000);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'resolved': return 'badge badge-resolved';
      case 'pending': return 'badge badge-pending';
      case 'open': return 'badge badge-open';
      default: return 'badge';
    }
  }
}