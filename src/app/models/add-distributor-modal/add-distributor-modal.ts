import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { getUserFriendlyError } from '../../shared/user-facing-error';

@Component({
  selector: 'app-add-distributor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-distributor-modal.html',
  styleUrl: './add-distributor-modal.css'
})
export class AddDistributorModal {

  @Output() close = new EventEmitter<void>();
  @Output() distributorSaved = new EventEmitter<void>();

  // Form Fields mapped to User model & Invite API
  firstName: string = '';
  lastName: string = '';
  companyName: string = '';
  email: string = '';
  phone: string = '';

  isSaving: boolean = false;
  errorMessage: string = '';

  constructor(private userService: UserService) { }

  saveDistributor() {
    if (!this.firstName || !this.lastName || !this.email || !this.phone) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const payload: any = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      role: 'DISTRIBUTOR'
    };

    if (this.phone?.trim()) {
      payload.phone = this.phone.trim();
    }
    
    if (this.companyName?.trim()) {
      payload.companyName = this.companyName.trim();
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.userService.inviteUser(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.distributorSaved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSaving = false;

        this.errorMessage = getUserFriendlyError(err, 'We could not invite this distributor. Please check the details and try again.');
        console.error('Invite Distributor Error Details:', err.error);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}
