import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ShipmentService } from '../../../services/shipment.service';
import { AuthService } from '../../../services/auth.service';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';
import { RateService } from '../../../services/rate.service';

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
  private rateService = inject(RateService);
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
      value: '3.2 Days',
      icon: 'fas fa-clock',
      bgColor: '#e0f2fe',
      iconColor: '#0284c7',
      percentage: 0,
      symbol: '-',
      compairTo: 'faster than last month'
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

  receiverName = 'Ankit Verma';
  receiverPhone = '9876543211';
  receiverEmail = 'ankit@example.com';
  receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
  receiverPincode = '110001';
  receiverCity = 'Delhi';
  receiverState = 'Delhi';

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
        if (res.data) {
          this.shipmentCards[0].value = res.data.total?.toString() || '0';
          this.shipmentCards[1].value = res.data.inTransit?.toString() || '0';
          this.shipmentCards[2].value = res.data.delivered?.toString() || '0';
          this.shipmentCards[3].value = res.data.pendingPickup?.toString() || '0';
          this.shipmentCards[4].value = res.data.rto?.toString() || '0';
          this.shipmentCards[6].value = `₹${(res.data.totalCost || 0).toLocaleString('en-IN')}`;
        }
      },
      error: (err) => console.error('Failed to load shipment stats:', err)
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
    this.receiverName = 'Ankit Verma';
    this.receiverPhone = '9876543211';
    this.receiverEmail = 'ankit@example.com';
    this.receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
    this.receiverPincode = '110001';
    this.receiverCity = 'Delhi';
    this.receiverState = 'Delhi';
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
        this.closeCreateModal();
        this.loadShipments();
        this.loadStats();
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
    if (confirm('Are you sure you want to cancel this shipment? This will refund the shipping cost to your wallet.')) {
      this.shipmentService.cancelShipment(id).subscribe({
        next: () => {
          alert('Shipment cancelled successfully.');
          this.closeDetailsModal();
          this.loadShipments();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'Failed to cancel shipment.')
      });
    }
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
