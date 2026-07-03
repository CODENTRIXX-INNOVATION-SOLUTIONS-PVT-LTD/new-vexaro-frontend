import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';
import { ShipmentService } from '../../../services/shipment.service';
import { RateService } from '../../../services/rate.service';

@Component({
  selector: 'app-create-shipment',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './create-shipment.html',
  styleUrls: ['./create-shipment.css'],
})
export class CreateShipment implements OnInit {
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private shipmentService = inject(ShipmentService);
  private rateService = inject(RateService);

  // Payment and order fields
  merchantOrderRef = '';
  declaredValue = 100;
  isCOD = false;
  codAmount = 0;

  currentStep = signal(1);
  isLoadingRates = signal(false);
  isSubmitting = signal(false);
  errorMessage = '';

  // Step 1: Pickup details
  pickupAddress = 'Loading warehouse details...';
  pickupContact = '';
  pickupPhone = '';
  pickupEmail = '';
  warehousePincode = '';
  warehouseId = '';
  selectedWarehouseMongoId = '';
  addresses: string[] = [];
  warehouses: MerchantWarehouse[] = [];

  addNewAddress(): void {
    this.router.navigate(['/merchant/warehouse']);
  }

  // Step 2: Receiver details
  receiverName = '';
  receiverPhone = '';
  receiverEmail = '';
  receiverAddress = '';
  receiverPincode = '';
  receiverCity = '';
  receiverState = '';

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
    this.merchantService.listMyWarehouses().subscribe({
      next: (res) => {
        this.warehouses = res.data?.warehouses || [];
        if (!this.warehouses.length) {
          this.pickupAddress = '';
          this.errorMessage = 'No active pickup warehouse found. Please create or activate a warehouse first.';
          return;
        }
        this.addresses = this.warehouses.map(wh => this.formatWarehouseAddress(wh));
        this.applyWarehouse(this.warehouses[0]);
      },
      error: (err) => {
        console.error('Failed to load warehouses:', err);
        this.errorMessage = err.error?.message || 'Failed to load warehouse details.';
      }
    });
  }

  getWarehouseOptionId(warehouse: MerchantWarehouse): string {
    return warehouse._id || warehouse.id || '';
  }

  selectWarehouse(warehouseMongoId: string): void {
    const warehouse = this.warehouses.find(wh => this.getWarehouseOptionId(wh) === warehouseMongoId);
    if (warehouse) this.applyWarehouse(warehouse);
  }

  private applyWarehouse(wh: MerchantWarehouse): void {
    this.selectedWarehouseMongoId = this.getWarehouseOptionId(wh);
    this.warehouseId = wh.warehouseId;
    this.pickupAddress = this.formatWarehouseAddress(wh);
    this.pickupContact = wh.contactPerson || '';
    this.pickupPhone = wh.phone || '';
    this.pickupEmail = wh.email || '';
    this.warehousePincode = wh.pincode || '';
  }

  formatWarehouseAddress(wh: MerchantWarehouse): string {
    return `${wh.name || wh.warehouseId || 'Warehouse'}, ${wh.address || ''}, ${wh.city || ''}, ${wh.state || ''} - ${wh.pincode || ''}`.replace(/\s+,/g, ',').trim();
  }

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()]?.rate || 0;
  }

  get selectedCourierRateLabel(): string {
    const selected = this.couriers[this.selectedCourierIndex()];
    if (!selected) return 'Select courier';
    return selected.rate > 0 ? `Rs ${selected.rate.toFixed(2)}` : 'Calculated after booking';
  }

  nextStep(): void {
    this.errorMessage = '';
    if (!this.isCurrentStepValid()) return;
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
    this.couriers = [];
    this.selectedCourierIndex.set(0);
    this.isLoadingRates.set(true);

    const isCODVal = this.isCOD;
    const codAmtVal = isCODVal ? this.codAmount : 0;

    this.shipmentService.checkServiceability({
      fromPincode: this.warehousePincode,
      toPincode: this.receiverPincode,
      isCOD: isCODVal,
      isForward: true,
      weight: this.weight,
      length: this.length,
      breadth: this.width,
      height: this.height,
      codAmount: codAmtVal,
    }).subscribe({
      next: (res) => {
        const carriers = res.data?.carriers || res.carriers || [];
        if (carriers.length > 0) {
          // Fetch the calculated Vexaro rate
          this.rateService.calculateRate({
            weight: this.weight,
            serviceType: 'STANDARD',
            isCOD: isCODVal,
            codAmount: codAmtVal,
          }).subscribe({
            next: (rateRes) => {
              this.isLoadingRates.set(false);
              const totalCharge = Number(rateRes.data?.totalCharge || rateRes.totalCharge || 0);

              this.couriers = carriers.map((c: any) => {
                return {
                  id: c.carrier_id || c.carrierId || c.id,
                  name: c.carrier_name || c.carrierName || c.name || 'Courier',
                  type: c.mode || c.service_type || 'Forward shipment',
                  rate: totalCharge,
                  rateLabel: totalCharge > 0 ? `Rs ${totalCharge.toFixed(2)}` : 'Available',
                  logo: 'fas fa-truck-fast',
                  color: '#1e293b'
                };
              });
            },
            error: (err) => {
              console.error('Failed to calculate rate:', err);
              this.isLoadingRates.set(false);
              this.couriers = carriers.map((c: any) => ({
                id: c.carrier_id || c.carrierId || c.id,
                name: c.carrier_name || c.carrierName || c.name || 'Courier',
                type: c.mode || c.service_type || 'Forward shipment',
                rate: 0,
                rateLabel: 'Available',
                logo: 'fas fa-truck-fast',
                color: '#1e293b'
              }));
              this.errorMessage = 'Could not calculate shipping charge. Using standard rate.';
            }
          });
        } else {
          this.isLoadingRates.set(false);
          this.couriers = [];
          this.errorMessage = 'No courier is serviceable for this pickup and delivery pincode.';
        }
      },
      error: (err) => {
        this.isLoadingRates.set(false);
        this.couriers = [];
        this.errorMessage = err.error?.message || 'Failed to check serviceability.';
      }
    });
  }

  createShipment(): void {
    if (this.isSubmitting()) return;
    this.errorMessage = '';
    if (!this.isCurrentStepValid()) {
      alert(this.errorMessage);
      return;
    }
    const selected = this.couriers[this.selectedCourierIndex()];
    if (!selected) {
      this.errorMessage = 'Please select a courier to book shipment.';
      alert(this.errorMessage);
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
      warehouseId: this.selectedWarehouseMongoId,
      destination: {
        name: this.receiverName,
        phone: this.receiverPhone,
        ...(this.receiverEmail ? { email: this.receiverEmail } : {}),
        addressLine: this.receiverAddress,
        city: this.receiverCity,
        state: this.receiverState,
        pincode: this.receiverPincode,
      },
      carrierId: selected.id,
      isCOD: this.isCOD,
      codAmount: this.isCOD ? this.codAmount : 0,
      declaredValue: this.declaredValue,
      merchantOrderRef: this.merchantOrderRef || undefined,
    };

    this.isSubmitting.set(true);
    this.shipmentService.createShipment(payload).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        alert('Shipment created successfully!');
        this.router.navigate(['/merchant/shipments']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create shipment.';
        alert(this.errorMessage);
      }
    });
  }

  private isCurrentStepValid(): boolean {
    const phonePattern = /^[6-9]\d{9}$/;
    const pincodePattern = /^\d{6}$/;

    if (this.currentStep() === 1) {
      if (!this.selectedWarehouseMongoId || !pincodePattern.test(this.warehousePincode || '')) {
        this.errorMessage = 'Please select a pickup warehouse with a valid 6 digit pincode.';
        return false;
      }
    }

    if (this.currentStep() === 2) {
      if (!this.receiverName.trim() || !phonePattern.test(this.receiverPhone || '') || !this.receiverAddress.trim() || !pincodePattern.test(this.receiverPincode || '') || !this.receiverCity.trim() || !this.receiverState.trim()) {
        this.errorMessage = 'Please enter complete receiver details with a valid 10 digit phone and 6 digit pincode.';
        return false;
      }
    }

    if (this.currentStep() === 3 || this.currentStep() === 4) {
      if (!this.weight || this.weight <= 0 || !this.length || !this.width || !this.height || this.length <= 0 || this.width <= 0 || this.height <= 0) {
        this.errorMessage = 'Package weight and dimensions must be greater than zero.';
        return false;
      }
      if (this.declaredValue === undefined || this.declaredValue <= 0) {
        this.errorMessage = 'Declared value must be greater than zero.';
        return false;
      }
      if (this.isCOD) {
        if (this.codAmount === undefined || this.codAmount <= 0) {
          this.errorMessage = 'COD Amount must be greater than zero when Cash on Delivery is enabled.';
          return false;
        }
        if (this.codAmount > this.declaredValue) {
          this.errorMessage = 'COD Amount cannot exceed the declared value.';
          return false;
        }
      }
    }

    return true;
  }
}
