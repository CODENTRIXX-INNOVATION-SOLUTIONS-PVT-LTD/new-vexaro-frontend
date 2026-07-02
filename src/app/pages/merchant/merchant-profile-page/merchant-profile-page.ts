import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-merchant-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-profile-page.html',
  styleUrl: './merchant-profile-page.css',
})
export class MerchantProfilePage {
  activeTab: string = 'shop';
  saveSuccess: boolean = false;

  changeTab(tab: string) {
    this.activeTab = tab;
    this.saveSuccess = false;
  }

  // ─── Shop Information ─────────────────────────────────────────────────────
  shop = {
    shopName: 'Raj Courier Shop',
    businessName: 'Raj Courier & Logistics Pvt. Ltd.',
    gstNumber: '23ABCDE1234F1Z5',
    businessType: 'Courier & Logistics Services',
    registrationNumber: 'REG-2024-BPL-0421',
    registrationDate: '2024-03-15',
  };

  businessTypes = [
    'Courier & Logistics Services',
    'E-Commerce Fulfillment',
    'Last Mile Delivery',
    'Freight & Cargo',
    'Cold Chain Logistics',
    'Hyperlocal Delivery',
  ];

  // ─── Owner Information ────────────────────────────────────────────────────
  owner = {
    ownerName: 'Raj Sharma',
    mobile: '9876543210',
    email: 'raj@example.com',
    alternateContact: '9123456789',
    designation: 'Proprietor',
    aadhaarNumber: 'XXXX-XXXX-4321',
  };

  // ─── Business Address ─────────────────────────────────────────────────────
  address = {
    streetAddress: 'House No. 12, Near Railway Station',
    landmark: 'Opp. SBI Bank',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462001',
    country: 'India',
  };

  states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
    'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  // ─── Save ─────────────────────────────────────────────────────────────────
  saveChanges() {
    this.saveSuccess = true;
    setTimeout(() => { this.saveSuccess = false; }, 3500);
  }
}
