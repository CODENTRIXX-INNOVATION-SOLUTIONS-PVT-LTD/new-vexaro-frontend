import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, DecimalPipe],
  templateUrl: './create-shipment.html',
  styleUrls: ['./create-shipment.css'],
})
export class CreateShipment {
  constructor(private router: Router) { }

  currentStep = signal(1);

  // Step 1: Pickup details
  pickupAddress = 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301';
  pickupContact = 'Rahul Sharma';
  pickupPhone = '9876543210';
  pickupEmail = 'rahul@vasamostore.com';

  addresses = [
    'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
    'Warehouse Alpha, Plot 45, Udyog Vihar, Gurugram, Haryana - 122008',
    'Retail Hub, Shop 12, Connaught Place, New Delhi - 110001'
  ];

  // Step 2: Receiver details
  receiverName = 'Ankit Verma';
  receiverPhone = '9876543211';
  receiverEmail = 'ankit@example.com';
  receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
  receiverPincode = '110001';
  receiverCity = 'Delhi';
  receiverState = 'Delhi';

  // Step 3: Package details
  weight = 2.5;
  length = 20;
  width = 15;
  height = 10;
  itemType = 'Documents';
  isFragile = false;

  itemTypes = ['Documents', 'Parcel', 'Electronics', 'Apparel', 'Medicines'];

  // Step 4: Summary & Rate selection
  selectedCourierIndex = signal(0);

  couriers = [
    { name: 'Delhivery', type: 'Surface', rate: 120.00, logo: 'fas fa-truck-fast', color: '#2563eb' },
    { name: 'Blue Dart', type: 'Air', rate: 248.00, logo: 'fas fa-plane-departure', color: '#0f172a' },
    { name: 'Ecom Express', type: 'Surface', rate: 112.00, logo: 'fas fa-shipping-fast', color: '#16a34a' },
    { name: 'XpressBees', type: 'Surface', rate: 96.00, logo: 'fas fa-bolt', color: '#ea580c' }
  ];

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()].rate;
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  selectStep(step: number): void {
    // Only allow selecting a step if it's less than or equal to current step
    // or if we have filled the preceding step information
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  addNewAddress(): void {
    alert('Add New Address modal feature coming soon!');
  }

  createShipment(): void {
    alert('Shipment created successfully!');
    // Navigate back to shipments list
    this.router.navigate(['/merchant/shipments']);
  }
}
