import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { MerchantService } from '../../../services/merchant.service';
import { ShipmentService } from '../../../services/shipment.service';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, DecimalPipe],
  templateUrl: './create-shipment.html',
  styleUrls: ['./create-shipment.css'],
})
export class CreateShipment implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private merchantService = inject(MerchantService);
  private shipmentService = inject(ShipmentService);

  currentStep = signal(1);
  isLoadingRates = signal(false);

  // Step 1: Pickup details
  pickupAddress = 'Loading warehouse details...';
  pickupContact = '';
  pickupPhone = '';
  pickupEmail = '';
  warehousePincode = '';
  warehouseId = '';
  addresses: string[] = [];

  addNewAddress(): void {
    alert('Add Address feature coming soon!');
  }

  // Step 2: Receiver details
  receiverName = 'Ankit Verma';
  receiverPhone = '9876543211';
  receiverEmail = 'ankit@example.com';
  receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
  receiverPincode = '110001';
  receiverCity = 'Delhi';
  receiverState = 'Delhi';

  // Step 3: Package details
  weight = 0.5;
  length = 10;
  width = 10;
  height = 10;
  itemType = 'Parcel';
  isFragile = false;

  itemTypes = ['Documents', 'Parcel', 'Electronics', 'Apparel', 'Medicines'];

  // Step 4: Summary & Rate selection
  selectedCourierIndex = signal(0);
  couriers: any[] = [];

  ngOnInit(): void {
    this.loadWarehouseDetails();
  }

  loadWarehouseDetails(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.merchantService.getMerchantById(user.id).subscribe({
          next: (res) => {
            if (res.data && res.data.warehouse) {
              const wh = res.data.warehouse;
              this.warehouseId = wh.warehouseId;
              this.pickupAddress = `${wh.name || 'Warehouse'}, ${wh.address}, ${wh.city}, ${wh.state} - ${wh.pincode}`;
              this.pickupContact = wh.contactPerson;
              this.pickupPhone = wh.phone || '';
              this.pickupEmail = wh.email || '';
              this.warehousePincode = wh.pincode;
            }
          },
          error: (err) => console.error('Failed to load merchant profile:', err)
        });
      },
      error: (err) => console.error('Failed to load user profile:', err)
    });
  }

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()]?.rate || 0;
  }

  nextStep(): void {
    if (this.currentStep() === 3) {
      this.checkServiceability();
    }
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
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  checkServiceability(): void {
    this.isLoadingRates.set(true);
    this.shipmentService.checkServiceability({
      fromPincode: this.warehousePincode,
      toPincode: this.receiverPincode,
      isCOD: false,
      isForward: true,
      weight: this.weight,
      length: this.length,
      breadth: this.width,
      height: this.height,
    }).subscribe({
      next: (res) => {
        this.isLoadingRates.set(false);
        if (res.carriers && res.carriers.length > 0) {
          this.couriers = res.carriers.map((c: any) => ({
            id: c.carrierId,
            name: c.carrierName,
            type: c.mode || 'Standard',
            rate: c.price,
            logo: 'fas fa-truck-fast',
            color: '#1e293b'
          }));
        } else {
          this.couriers = [];
        }
      },
      error: () => {
        this.isLoadingRates.set(false);
        this.couriers = [];
      }
    });
  }

  createShipment(): void {
    const selected = this.couriers[this.selectedCourierIndex()];
    if (!selected) {
      alert('Please select a courier to book shipment.');
      return;
    }

    const payload = {
      serviceType: 'STANDARD',
      weight: this.weight,
      length: this.length,
      breadth: this.width,
      height: this.height,
      itemType: this.itemType,
      isFragile: this.isFragile,
      destination: {
        name: this.receiverName,
        phone: this.receiverPhone,
        email: this.receiverEmail,
        addressLine: this.receiverAddress,
        city: this.receiverCity,
        state: this.receiverState,
        pincode: this.receiverPincode,
      },
      carrierId: selected.id,
    };

    this.shipmentService.createShipment(payload).subscribe({
      next: () => {
        alert('Shipment created successfully!');
        this.router.navigate(['/merchant/shipments']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create shipment.');
      }
    });
  }
}
