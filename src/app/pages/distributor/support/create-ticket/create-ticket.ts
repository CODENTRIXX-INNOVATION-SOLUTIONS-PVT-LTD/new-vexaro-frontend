import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../../../services/support.service';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket.html',
  styleUrl: './create-ticket.css'
})
export class CreateTicket {
  ticketData = {
    subject: '',
    category: '',
    priority: 'Medium',
    description: ''
  };

  isSubmitting: boolean = false;

  constructor(private router: Router, private supportService: SupportService) {}

  submitTicket() {
    if(!this.ticketData.subject || !this.ticketData.category || !this.ticketData.description) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    this.isSubmitting = true;
    this.supportService.createTicket({
      subject: this.ticketData.subject,
      category: this.ticketData.category,
      priority: this.ticketData.priority,
      description: this.ticketData.description
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert('Ticket Created Successfully!');
        this.router.navigate(['/distributor/support/tickets']);
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/distributor/support/tickets']);
  }
}
