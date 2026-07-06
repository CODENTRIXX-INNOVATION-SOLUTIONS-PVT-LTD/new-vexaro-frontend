import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../../../services/support.service';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket.html',
  styleUrl: './create-ticket.css',
})
export class CreateTicket {
  private supportService = inject(SupportService);
  private router         = inject(Router);

  ticketData = {
    subject:     '',
    category:    '',
    priority:    'MEDIUM',
    description: '',
  };

  isSubmitting = false;
  error        = '';
  success      = '';

  submitTicket(): void {
    const { subject, category, description } = this.ticketData;
    if (!subject.trim() || !category || !description.trim()) {
      this.error = 'Subject, category, and description are required.';
      return;
    }
    this.isSubmitting = true;
    this.error        = '';

    this.supportService.createTicket({
      subject:     subject.trim(),
      category:    this.ticketData.category,
      priority:    this.ticketData.priority,
      description: description.trim(),
    }).subscribe({
      next: (res) => {
        const ticketId = res?.data?.ticketId ?? res?.data?._id ?? '';
        this.success      = `Ticket created successfully! ${ticketId ? 'ID: ' + ticketId : ''}`;
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/distributor/support/tickets']), 1500);
      },
      error: (err) => {
        this.error        = err?.error?.message || 'Failed to create ticket. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/distributor/support/tickets']);
  }
}
