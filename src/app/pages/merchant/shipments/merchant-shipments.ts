import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ShipmentService } from '../../../services/shipment.service';
import { AuthService } from '../../../services/auth.service';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';

@Component({
  selector: 'app-merchant-shipments',
  standalone: true,
  imports: [CommonModule, StatsCards, RouterLink, FormsModule],
  templateUrl: './merchant-shipments.html',
  styleUrl: './merchant-shipments.css',
})
export class MerchantShipments implements OnInit {
  private shipmentService = inject(ShipmentService);
  private authService = inject(AuthService);
  private merchantService = inject(MerchantService);
  private router = inject(Router);

  isSubmitting = signal(false);
  merchantOrderRef = '';
  declaredValue = 100;
  isCOD = false;
  codAmount = 0;

  shipmentCards = [
    {
      title: 'Total Shipments',
      value: '0',
      icon: 'fas fa-boxes',
      bgColor: '#dbeafe',
      iconColor: 'rgb(11, 74, 111)',
      percentage: 0,
      symbol: '+',
      compairTo: 'vs last month'
    },
    {
      title: 'In Transit',
      value: '0',
      icon: 'fas fa-truck-moving',
      bgColor: '#fef3c7',
      iconColor: '#d97706',
      percentage: 0,
      symbol: '+',
      compairTo: 'currently moving'
    },
    {
      title: 'Delivered',
      value: '0',
      icon: 'fas fa-check-circle',
      bgColor: '#dcfce7',
      iconColor: '#16a34a',
      percentage: 0,
      symbol: '+',
      compairTo: 'successful deliveries'
    },
    {
      title: 'Pending Pickup',
      value: '0',
      icon: 'fas fa-store',
      bgColor: '#ede9fe',
      iconColor: '#7c3aed',
      percentage: 0,
      symbol: '-',
      compairTo: 'awaiting pickup'
    },
    {
      title: 'RTO',
      value: '0',
      icon: 'fas fa-undo-alt',
      bgColor: '#fee2e2',
      iconColor: '#dc2626',
      percentage: 0,
      symbol: '-',
      compairTo: 'returned orders'
    },
    {
      title: 'Delivered Today',
      value: '0',
      icon: 'fas fa-calendar-check',
      bgColor: '#cffafe',
      iconColor: '#0891b2',
      percentage: 0,
      symbol: '+',
      compairTo: 'today'
    },
    {
      title: 'Total Shipping Cost',
      value: '₹0',
      icon: 'fas fa-money-bill-wave',
      bgColor: '#fef9c3',
      iconColor: '#ca8a04',
      percentage: 0,
      symbol: '+',
      compairTo: 'this month'
    },
    {
      title: 'Average Delivery Time',
      value: '—',
      icon: 'fas fa-clock',
      bgColor: '#e0f2fe',
      iconColor: '#0284c7',
      percentage: 0,
      symbol: '-',
      compairTo: 'from delivered shipments'
    }
  ];

  shipments: any[] = [];

  // Modal visibility
  showCreateModal = signal(false);
  showDetailsModal = signal(false);

  // Selected shipment details
  selectedShipment = signal<any>(null);

  // Wizard active step
  currentStep = signal(1);

  // Form input properties
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
    this.closeCreateModal();
    this.router.navigate(['/merchant/warehouse']);
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

  private formatWarehouseAddress(wh: MerchantWarehouse): string {
    return `${wh.name || wh.warehouseId || 'Warehouse'}, ${wh.address || ''}, ${wh.city || ''}, ${wh.state || ''} - ${wh.pincode || ''}`.replace(/\s+,/g, ',').trim();
  }

  receiverName = '';
  receiverPhone = '';
  receiverEmail = '';
  receiverAddress = '';
  receiverPincode = '';
  receiverCity = '';
  receiverState = '';

  weight = 0.5;
  length = 10;
  width = 10;
  height = 10;
  itemType = 'Parcel';
  isFragile = false;

  itemTypes = ['Documents', 'Parcel', 'Electronics', 'Apparel', 'Medicines'];

  selectedCourierIndex = signal(0);
  couriers: any[] = [];
  isLoadingRates = signal(false);

  ngOnInit(): void {
    this.loadShipments();
    this.loadStats();
    this.loadWarehouseDetails();
  }

  loadShipments(): void {
    this.shipmentService.listShipments({ limit: 100 }).subscribe({
      next: (res) => {
        if (res.data && res.data.shipments) {
          this.shipments = res.data.shipments.map((s: any) => ({
            id: s._id,
            awb: s.awb,
            carrierAWB: s.carrierAWB,
            customerName: s.destination?.name || '—',
            destination: `${s.destination?.city || ''}, ${s.destination?.state || ''}`,
            date: new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: `₹${s.merchantCost?.toFixed(2) || '0.00'}`,
            status: s.status,
            courier: s.carrier || '—',
            pickupContact: s.origin?.name || '',
            pickupPhone: s.origin?.phone || '',
            pickupAddress: `${s.origin?.addressLine || ''}, ${s.origin?.city || ''}, ${s.origin?.state || ''} - ${s.origin?.pincode || ''}`,
            receiverPhone: s.destination?.phone || '',
            receiverEmail: s.destination?.email || '',
            receiverAddress: `${s.destination?.addressLine || ''}, ${s.destination?.city || ''}, ${s.destination?.state || ''} - ${s.destination?.pincode || ''}`,
            weight: s.weight,
            length: s.length,
            width: s.breadth,
            height: s.height,
            itemType: s.itemType || 'Parcel',
            isFragile: s.isFragile || false,
            timeline: (s.statusHistory || []).map((h: any) => ({
              title: h.status,
              date: new Date(h.updatedAt).toLocaleString('en-IN'),
              status: 'completed'
            }))
          }));
        }
      },
      error: (err) => console.error('Failed to load shipments:', err)
    });
  }

  loadStats(): void {
    this.shipmentService.getStats().subscribe({
      next: (res) => {
        const d = res.data ?? res;
        const by = d?.byStatus ?? {};
        this.shipmentCards[0].value = (d?.total ?? 0).toLocaleString('en-IN');
        this.shipmentCards[1].value = (
          (by.PICKED_UP ?? 0) + (by.ARRIVED_AT_HUB ?? 0) + (by.OUT_FOR_DELIVERY ?? 0)
        ).toLocaleString('en-IN');
        this.shipmentCards[2].value = (by.DELIVERED ?? 0).toLocaleString('en-IN');
        this.shipmentCards[3].value = (by.ORDER_CREATED ?? 0).toLocaleString('en-IN');
        this.shipmentCards[4].value = (by.RTO ?? 0).toLocaleString('en-IN');
        this.shipmentCards[5].value = (d?.today ?? 0).toLocaleString('en-IN');
        this.shipmentCards[6].value = `₹${(d?.totalCost ?? 0).toLocaleString('en-IN')}`;
      },
      error: (err) => console.error('Failed to load shipment stats:', err),
    });
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

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()]?.rate || 0;
  }

  errorMessage = '';

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.currentStep.set(1);
    this.selectedCourierIndex.set(0);
    this.errorMessage = '';
    this.receiverName = '';
    this.receiverPhone = '';
    this.receiverEmail = '';
    this.receiverAddress = '';
    this.receiverPincode = '';
    this.receiverCity = '';
    this.receiverState = '';
    this.weight = 0.5;
    this.length = 10;
    this.width = 10;
    this.height = 10;
    this.itemType = 'Parcel';
    this.isFragile = false;
    this.merchantOrderRef = '';
    this.declaredValue = 100;
    this.isCOD = false;
    this.codAmount = 0;
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
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
    this.errorMessage = '';

    // Step 1 — serviceability
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

        // Step 2 — live Velocity rates per carrier
        this.shipmentService.getVelocityRates({
          journeyType:        'forward',
          originPincode:      this.warehousePincode,
          destinationPincode: this.receiverPincode,
          deadWeight:         this.weight * 1000,
          length:             this.length,
          width:              this.width,
          height:             this.height,
          paymentMethod:      this.isCOD ? 'cod' : 'prepaid',
          ...(this.isCOD && this.codAmount ? { shipmentValue: this.codAmount } : {}),
        }).subscribe({
          next: (rateRes) => {
            this.isLoadingRates.set(false);

            const velocityRates: any[] = rateRes.data?.serviceable_couriers
              || rateRes.data
              || rateRes
              || [];

            const rateByCarrierId: Record<string, any> = {};
            const rateByName: Record<string, any>      = {};
            if (Array.isArray(velocityRates)) {
              for (const r of velocityRates) {
                if (r.carrier_id)   rateByCarrierId[r.carrier_id]              = r;
                const name = r.carrier_name || r.courier_name;
                if (name) rateByName[name.toLowerCase()]   = r;
              }
            }

            this.couriers = carriers.map((c: any) => {
              const carrierId   = c.carrier_id  || c.carrierId  || '';
              const carrierName = c.carrier_name || c.carrierName || c.name || 'Courier';
              const rateEntry   = rateByCarrierId[carrierId]
                               || rateByName[carrierName.toLowerCase()]
                               || null;
              const charges = rateEntry?.charges || {};
              const rate = rateEntry
                ? Number(
                    charges.total_forward_charges
                    ?? charges.total_return_charges
                    ?? rateEntry.total_amount
                    ?? rateEntry.rate
                    ?? rateEntry.total
                    ?? 0
                  )
                : 0;
              return {
                id:    carrierId,
                name:  carrierName,
                type:  c.mode || c.service_type || 'Forward shipment',
                rate,
                etd:   rateEntry?.expected_delivery?.delivery || rateEntry?.etd || rateEntry?.estimated_delivery || null,
                logo:  'fas fa-truck-fast',
                color: '#1e293b',
              };
            });

            // Sort cheapest first
            this.couriers.sort((a, b) => {
              if (!a.rate && !b.rate) return 0;
              if (!a.rate) return 1;
              if (!b.rate) return -1;
              return a.rate - b.rate;
            });
          },
          error: () => {
            this.isLoadingRates.set(false);
            // Rates failed — still show carriers, price shown as 0
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
        this.errorMessage = err.error?.message || 'Failed to check serviceability.';
      },
    });
  }

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
      serviceType:  'STANDARD',
      weight:       this.weight,
      length:       this.length,
      breadth:      this.width,
      height:       this.height,
      warehouseId:  this.selectedWarehouseMongoId,
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
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.closeCreateModal();
        this.loadShipments();
        this.loadStats();
        // Brief success message in the errorMessage slot (green styling handled in template)
        this.errorMessage = `Shipment ${data.awb || ''} booked successfully via ${data.carrier || selected.name}!`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create shipment. Please try again.';
      },
    });
  }

  private isCurrentStepValid(): boolean {
    const phonePattern = /^[6-9]\d{9}$/;
    const pincodePattern = /^\d{6}$/;

    if (this.currentStep() === 1) {
      if (!this.selectedWarehouseMongoId || !this.warehousePincode || !this.pickupContact || !phonePattern.test(this.pickupPhone || '')) {
        this.errorMessage = 'Pickup warehouse contact, phone, and pincode are required.';
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

  cancelShipment(id: string): void {
    if (!confirm('Are you sure you want to cancel this shipment? This will refund the shipping cost to your wallet.')) return;
    this.shipmentService.cancelShipment(id).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadShipments();
        this.loadStats();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to cancel shipment.';
      },
    });
  }

  viewShipmentDetails(shipment: any): void {
    this.selectedShipment.set(shipment);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedShipment.set(null);
  }
}
