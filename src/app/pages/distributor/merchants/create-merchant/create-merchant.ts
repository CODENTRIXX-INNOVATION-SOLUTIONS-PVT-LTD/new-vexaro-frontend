import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-create-merchant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-merchant.html',
  styleUrl: './create-merchant.css'
})
export class CreateMerchant {
  currentStep = 1;
  totalSteps = 2;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Step 1 — Merchant Personal Info
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  companyName = '';

  // Step 2 — Warehouse Details (required for MERCHANT role)
  warehouseAddress = '';
  warehousePincode = '';
  warehouseCity = '';
  warehouseState = '';
  warehouseCountry = 'India';
  warehouseContactPerson = '';
  warehouseName = '';
  warehouseGstNo = '';

  readonly INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
  ];

  constructor(private router: Router, private userService: UserService) {}

  isStep1Valid(): boolean {
    return !!(
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
    );
  }

  isStep2Valid(): boolean {
    return !!(
      this.warehouseAddress.trim().length >= 5 &&
      this.warehousePincode.trim().length === 6 &&
      /^\d{6}$/.test(this.warehousePincode.trim()) &&
      this.warehouseCity.trim() &&
      this.warehouseState.trim() &&
      this.warehouseContactPerson.trim()
    );
  }

  nextStep() {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitMerchant() {
    if (!this.isStep1Valid() || !this.isStep2Valid()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: any = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      role: 'MERCHANT',
      warehouse: {
        address: this.warehouseAddress.trim(),
        pincode: this.warehousePincode.trim(),
        city: this.warehouseCity.trim(),
        state: this.warehouseState.trim(),
        country: this.warehouseCountry.trim() || 'India',
        contactPerson: this.warehouseContactPerson.trim(),
      }
    };

    if (this.phone?.trim()) payload.phone = this.phone.trim();
    if (this.companyName?.trim()) payload.companyName = this.companyName.trim();
    if (this.warehouseName?.trim()) payload.warehouse.name = this.warehouseName.trim();
    if (this.warehouseGstNo?.trim()) payload.warehouse.gstNo = this.warehouseGstNo.trim();

    this.userService.inviteUser(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Merchant invited successfully! An email has been sent to set their password.';
        setTimeout(() => this.router.navigate(['/distributor/merchants']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        let msg = err.error?.message || 'Failed to invite merchant. Please try again.';
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          msg = err.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | ');
        }
        this.errorMessage = msg;
        console.error('Create Merchant Error:', err.error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/distributor/merchants']);
  }
}