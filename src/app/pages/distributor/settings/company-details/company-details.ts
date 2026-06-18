import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css'
})
export class CompanyDetails {
  companyData = {
    businessName: 'Vexaro Logistics - Mumbai Central Hub',
    gstin: '27AABCV1234D1Z5',
    pan: 'AABCV1234D',
    addressLine1: '12, Logistics Park, BKC',
    addressLine2: 'Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    supportEmail: 'support.mumbai@vexaro.com',
    supportPhone: '+91 80000 11111'
  };

  isSaving: boolean = false;

  saveDetails() {
    this.isSaving = true;
    setTimeout(() => {
      alert('Company Details updated successfully!');
      this.isSaving = false;
    }, 1000);
  }
}
