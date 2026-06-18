import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  submitTicket() {
    if(!this.ticketData.subject || !this.ticketData.category || !this.ticketData.description) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      alert('Ticket Created Successfully! Ticket ID: TKT-1005');
      this.isSubmitting = false;
      this.router.navigate(['/distributor/support/tickets']);
    }, 1500);
  }

  cancel() {
    this.router.navigate(['/distributor/support/tickets']);
  }
}
