import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';
import { ShipmentService } from '../../../services/shipment.service';

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

  // ── Payment / order fields ────────────────────────────────────────────────
  merchantOrderRef = '';
  declaredValue = 100;
  isCOD = false;
  codAmount = 0;

  currentStep = signal(1);
  isLoadingRates = signal(false);
  isSubmitting = signal(false);
  errorMessage = '';

  // ── Success state (shown after booking instead of alert) ─────────────────
  bookingSuccess = signal(false);
  bookedAWB = signal('');
  bookedCarrierAWB = signal('');
  bookedCarrier = signal('');
  bookedLabelUrl = signal<string | null>(null);

  // ── Step 1: Pickup details ────────────────────────────────────────────────
  pickupAddress = '';
  pickupContact = '';
  pickupPhone = '';
  pickupEmail = '';
  warehousePincode = '';
  selectedWarehouseMongoId = '';
  warehouses: MerchantWarehouse[] = [];

  addNewAddress(): void {
    this.router.navigate(['/merchant/warehouse']);
  }

  // ── Step 2: Receiver details ──────────────────────────────────────────────
  receiverName = '';
  receiverPhone = '';
  receiverEmail = '';
  receiverAddress = '';
  receiverPincode = '';
  receiverCity = '';
  receiverState = '';

  // ── Step 3: Package details ───────────────────────────────────────────────
  weight = 0.5;
  length = 10;
  width = 10;
  height = 10;
  itemType = 'Parcel';
  isFragile = false;

  itemTypes = ['Documents', 'Parcel', 'Electronics', 'Apparel', 'Medicines'];

  // ── Step 4: Rate selection ────────────────────────────────────────────────
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
          this.errorMessage = 'No active pickup warehouse found. Please create or activate a warehouse first.';
          return;
        }
        this.applyWarehouse(this.warehouses[0]);
      },
      error: (err) => {
        console.error('Failed to load warehouses:', err);
        this.errorMessage = err.error?.message || 'Failed to load warehouse details.';
      },
    });
  }

  getWarehouseId(wh: MerchantWarehouse): string {
    return (wh as any)._id || (wh as any).id || '';
  }

  onWarehouseChange(mongoId: string): void {
    const wh = this.warehouses.find(w => this.getWarehouseId(w) === mongoId);
    if (wh) this.applyWarehouse(wh);
  }

  private applyWarehouse(wh: MerchantWarehouse): void {
    this.selectedWarehouseMongoId = this.getWarehouseId(wh);
    this.pickupAddress = this.formatWarehouseAddress(wh);
    this.pickupContact = wh.contactPerson || '';
    this.pickupPhone   = wh.phone || '';
    this.pickupEmail   = wh.email || '';
    this.warehousePincode = wh.pincode || '';
  }

  formatWarehouseAddress(wh: MerchantWarehouse): string {
    return `${wh.name || wh.warehouseId || 'Warehouse'}, ${wh.address || ''}, ${wh.city || ''}, ${wh.state || ''} - ${wh.pincode || ''}`
      .replace(/\s+,/g, ',')
      .trim();
  }

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()]?.rate || 0;
  }

  // ── Step navigation ───────────────────────────────────────────────────────
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

  // ── Serviceability check (called on Step 3 → 4 transition) ───────────────
  checkServiceability(): void {
    this.couriers = [];
    this.selectedCourierIndex.set(0);
    this.isLoadingRates.set(true);
    this.errorMessage = '';

    // Step 1 — check which carriers serve this route
    this.shipmentService.checkServiceability({
      fromPincode: this.warehousePincode,
      toPincode:   this.receiverPincode,
      isCOD:       this.isCOD,
      isForward:   true,
    }).subscribe({
      next: (res) => {
        const carriers: any[] = res.data?.carriers || res.carriers || [];

        if (!carriers.length) {
          this.isLoadingRates.set(false);
          this.errorMessage = 'No courier is serviceable for this pickup and delivery pincode.';
          return;
        }

        // Step 2 — get Velocity per-carrier rates for this exact shipment spec
        // deadWeightGrams: Velocity expects weight in grams
        this.shipmentService.getVelocityRates({
          journeyType:        'forward',
          originPincode:      this.warehousePincode,
          destinationPincode: this.receiverPincode,
          deadWeightGrams:    this.weight * 1000,   // kg → grams
          length:             this.length,
          width:              this.width,
          height:             this.height,
          paymentMethod:      this.isCOD ? 'cod' : 'prepaid',
          ...(this.isCOD && this.codAmount ? { shipmentValue: this.codAmount } : {}),
        }).subscribe({
          next: (rateRes) => {
            this.isLoadingRates.set(false);

            // Velocity returns an array of rate objects, each with courier_name and rate
            const velocityRates: any[] = rateRes.data || rateRes || [];

            // Build a lookup from carrier_id → Velocity rate entry
            const rateByCarrierId: Record<string, any> = {};
            const rateByName:      Record<string, any> = {};
            if (Array.isArray(velocityRates)) {
              for (const r of velocityRates) {
                if (r.carrier_id)   rateByCarrierId[r.carrier_id]   = r;
                if (r.courier_name) rateByName[r.courier_name.toLowerCase()] = r;
              }
            }

            // Merge serviceability carriers with rate data
            this.couriers = carriers.map((c: any) => {
              const carrierId  = c.carrier_id  || c.carrierId  || '';
              const carrierName = c.carrier_name || c.carrierName || c.name || 'Courier';

              // Match by carrier_id first, fall back to name match
              const rateEntry = rateByCarrierId[carrierId]
                || rateByName[carrierName.toLowerCase()]
                || null;

              const totalRate = rateEntry
                ? Number(rateEntry.total_amount ?? rateEntry.rate ?? rateEntry.total ?? 0)
                : 0;

              return {
                id:    carrierId,
                name:  carrierName,
                type:  c.mode || c.service_type || 'Forward shipment',
                rate:  totalRate,
                etd:   rateEntry?.etd || rateEntry?.estimated_delivery || null,
                logo:  'fas fa-truck-fast',
                color: '#1e293b',
              };
            });

            // Sort by rate ascending (cheapest first), unknown rates go to bottom
            this.couriers.sort((a, b) => {
              if (!a.rate && !b.rate) return 0;
              if (!a.rate) return 1;
              if (!b.rate) return -1;
              return a.rate - b.rate;
            });
          },
          error: (err) => {
            // Velocity rates failed — still show carriers but without pricing
            console.error('Velocity rates fetch failed:', err);
            this.isLoadingRates.set(false);
            this.couriers = carriers.map((c: any) => ({
              id:    c.carrier_id  || c.carrierId  || '',
              name:  c.carrier_name || c.carrierName || c.name || 'Courier',
              type:  c.mode || c.service_type || 'Forward shipment',
              rate:  0,
              etd:   null,
              logo:  'fas fa-truck-fast',
              color: '#1e293b',
            }));
            this.errorMessage = 'Could not fetch live carrier rates. Charges will be calculated at booking.';
          },
        });
      },
      error: (err) => {
        this.isLoadingRates.set(false);
        this.errorMessage = err.error?.message || 'Failed to check serviceability. Please try again.';
      },
    });
  }

  // ── Create shipment (Step 4 submit) ───────────────────────────────────────
  createShipment(): void {
    if (this.isSubmitting()) return;
    this.errorMessage = '';

    if (!this.isCurrentStepValid()) return;

    const selected = this.couriers[this.selectedCourierIndex()];
    if (!selected) {
      this.errorMessage = 'Please select a courier to book shipment.';
      return;
    }

    const payload = {
      serviceType:      'STANDARD',
      weight:           this.weight,
      length:           this.length,
      breadth:          this.width,
      height:           this.height,
      warehouseId:      this.selectedWarehouseMongoId,
      destination: {
        name:        this.receiverName,
        phone:       this.receiverPhone,
        ...(this.receiverEmail ? { email: this.receiverEmail } : {}),
        addressLine: this.receiverAddress,
        city:        this.receiverCity,
        state:       this.receiverState,
        pincode:     this.receiverPincode,
      },
      carrierId:        selected.id || undefined,
      isCOD:            this.isCOD,
      codAmount:        this.isCOD ? this.codAmount : 0,
      declaredValue:    this.declaredValue,
      ...(this.merchantOrderRef ? { merchantOrderRef: this.merchantOrderRef } : {}),
    };

    this.isSubmitting.set(true);

    this.shipmentService.createShipment(payload).pipe(
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: (res) => {
        const data = res.data || res;
        // Show inline success state with AWB and label URL
        this.bookedAWB.set(data.awb || '');
        this.bookedCarrierAWB.set(data.carrierAWB || '');
        this.bookedCarrier.set(data.carrier || selected.name || '');
        this.bookedLabelUrl.set(data.labelUrl || null);
        this.bookingSuccess.set(true);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create shipment. Please try again.';
      },
    });
  }

  goToShipments(): void {
    this.router.navigate(['/merchant/shipments']);
  }

  bookAnother(): void {
    this.bookingSuccess.set(false);
    this.currentStep.set(1);
    this.bookedAWB.set('');
    this.bookedCarrierAWB.set('');
    this.bookedCarrier.set('');
    this.bookedLabelUrl.set(null);
    this.couriers = [];
    this.receiverName = '';
    this.receiverPhone = '';
    this.receiverEmail = '';
    this.receiverAddress = '';
    this.receiverPincode = '';
    this.receiverCity = '';
    this.receiverState = '';
    this.merchantOrderRef = '';
    this.isCOD = false;
    this.codAmount = 0;
    this.declaredValue = 100;
    this.weight = 0.5;
    this.length = 10;
    this.width = 10;
    this.height = 10;
  }

  // ── Per-step form validation ──────────────────────────────────────────────
  private isCurrentStepValid(): boolean {
    const phonePattern   = /^[6-9]\d{9}$/;
    const pincodePattern = /^\d{6}$/;

    if (this.currentStep() === 1) {
      if (!this.selectedWarehouseMongoId || !pincodePattern.test(this.warehousePincode)) {
        this.errorMessage = 'Please select a pickup warehouse with a valid 6-digit pincode.';
        return false;
      }
    }

    if (this.currentStep() === 2) {
      if (
        !this.receiverName.trim() ||
        !phonePattern.test(this.receiverPhone)    ||
        !this.receiverAddress.trim()              ||
        !pincodePattern.test(this.receiverPincode)||
        !this.receiverCity.trim()                 ||
        !this.receiverState.trim()
      ) {
        this.errorMessage = 'Please enter complete receiver details with a valid 10-digit phone and 6-digit pincode.';
        return false;
      }
    }

    if (this.currentStep() === 3 || this.currentStep() === 4) {
      if (!this.weight || this.weight <= 0 || !this.length || !this.width || !this.height ||
          this.length <= 0 || this.width <= 0 || this.height <= 0) {
        this.errorMessage = 'Package weight and dimensions must be greater than zero.';
        return false;
      }
      if (!this.declaredValue || this.declaredValue <= 0) {
        this.errorMessage = 'Declared value must be greater than zero.';
        return false;
      }
      if (this.isCOD) {
        if (!this.codAmount || this.codAmount <= 0) {
          this.errorMessage = 'COD amount must be greater than zero when Cash on Delivery is enabled.';
          return false;
        }
        if (this.codAmount > this.declaredValue) {
          this.errorMessage = 'COD amount cannot exceed the declared value.';
          return false;
        }
      }
    }

    return true;
  }
}
