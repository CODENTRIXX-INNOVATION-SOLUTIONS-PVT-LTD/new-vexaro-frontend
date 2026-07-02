import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css'
})
export class CompanyDetails implements OnInit {
  userId: string = '';
  companyData = {
    businessName: '',
    gstin: '',
    pan: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    supportEmail: '',
    supportPhone: ''
  };

  isSaving: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.loadCompanyDetails();
  }

  loadCompanyDetails() {
    this.isLoading = true;
    this.authService.getMe().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const user = response.data;
          this.userId = user.id || user._id || '';
          this.companyData = {
            businessName: user.businessName || '',
            gstin: user.gstin || '',
            pan: user.pan || '',
            addressLine1: user.addressLine1 || '',
            addressLine2: user.addressLine2 || '',
            city: user.city || '',
            state: user.state || '',
            pincode: user.pincode || '',
            supportEmail: user.supportEmail || '',
            supportPhone: user.supportPhone || ''
          };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading company details:', error);
        this.isLoading = false;
      }
    });
  }

  saveDetails() {
    if (!this.userId) {
      alert('User ID not found. Please refresh the page.');
      return;
    }
    this.isSaving = true;
    this.userService.updateUser(this.userId, {
      businessName: this.companyData.businessName,
      gstin: this.companyData.gstin,
      pan: this.companyData.pan,
      addressLine1: this.companyData.addressLine1,
      addressLine2: this.companyData.addressLine2,
      city: this.companyData.city,
      state: this.companyData.state,
      pincode: this.companyData.pincode,
      supportEmail: this.companyData.supportEmail,
      supportPhone: this.companyData.supportPhone
    }).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        alert('Company Details updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating company details:', error);
        this.isSaving = false;
        alert(error.error?.message || 'Failed to update company details. Please try again.');
      }
    });
  }
}
