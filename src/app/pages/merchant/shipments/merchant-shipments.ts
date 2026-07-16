import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ShipmentService } from '../../../services/shipment.service';
import { AuthService } from '../../../services/auth.service';
import { MerchantService, MerchantWarehouse } from '../../../services/merchant.service';
import { getUserFriendlyError } from '../../../shared/user-facing-error';

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
  isLoadingShipments = false;
  shipmentListError = '';
  shipmentSearch = '';
  shipmentPage = 1;
  shipmentLimit = 20;
  shipmentTotal = 0;
  shipmentTotalPages = 1;
  shipmentHasNextPage = false;
  shipmentHasPrevPage = false;

  // Modal visibility
  showCreateModal = signal(false);
  showDetailsModal = signal(false);

  // Selected shipment details
  selectedShipment = signal<any>(null);
  shipmentActionError = '';
  shipmentActionSuccess = '';
  isShipmentActionLoading = signal(false);
  showNdrForm = signal(false);
  ndrAddressLine = '';
  ndrLandmark = '';
  ndrPhone = '';
  ndrComments = '';

  // Reverse pickup properties
  shipmentTypeFilter = signal<'all' | 'forward' | 'return'>('all');
  showReverseModal = signal(false);
  reversePickupName = '';
  reversePickupPhone = '';
  reversePickupEmail = '';
  reversePickupAddress = '';
  reversePickupCity = '';
  reversePickupState = '';
  reversePickupPincode = '';
  reversePickupCountry = 'India';
  reverseWarehouseMongoId = '';
  reverseWarehouseAddress = '';
  reverseOrderItems: any[] = [];
  reverseLength = 10;
  reverseBreadth = 10;
  reverseHeight = 10;
  reverseWeight = 0.5;
  reverseSubTotal = 0;
  reversePaymentMethod = 'PREPAID';
  reverseOrderId = '';

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

  productName = '';
  sku = '';
  quantity = 1;
  sellingPrice = 100;
  discount = 0;
  tax = 0;
  paymentMethod = 'PREPAID';

  updateOrderValue(): void {
    const calculated = (Number(this.sellingPrice || 0) * Number(this.quantity || 0)) - Number(this.discount || 0) + Number(this.tax || 0);
    this.declaredValue = Math.max(0, calculated);
    if (this.isCOD) this.codAmount = this.declaredValue;
  }

  onPaymentMethodChange(value: string): void {
    this.paymentMethod = value === 'COD' ? 'COD' : 'PREPAID';
    this.isCOD = this.paymentMethod === 'COD';
    this.codAmount = this.isCOD ? this.declaredValue : 0;
  }

  selectedCourierIndex = signal(0);
  couriers: any[] = [];
  isLoadingRates = signal(false);

  ngOnInit(): void {
    this.loadShipments();
    this.loadStats();
    this.loadWarehouseDetails();
  }

  private formatDateTime(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  private formatDatePart(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTimePart(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  loadShipments(): void {
    this.isLoadingShipments = true;
    this.shipmentListError = '';

    const query: any = {
      page: this.shipmentPage,
      limit: this.shipmentLimit,
    };
    const search = this.shipmentSearch.trim();
    if (search) query.search = search;

    const type = this.shipmentTypeFilter();
    if (type !== 'all') {
      query.shipmentType = type;
    }

    this.shipmentService.listShipments(query).pipe(
      finalize(() => { this.isLoadingShipments = false; }),
    ).subscribe({
      next: (res) => {
        const meta = res.meta || {};
        this.shipmentTotal = meta.total ?? 0;
        this.shipmentTotalPages = meta.pages ?? 1;
        this.shipmentHasNextPage = Boolean(meta.hasNextPage);
        this.shipmentHasPrevPage = Boolean(meta.hasPrevPage);

        if (res.data && res.data.shipments) {
          this.shipments = res.data.shipments.map((s: any) => ({
            id: s._id,
            awb: s.awb,
            carrierAWB: s.carrierAWB,
            trackingId: s.carrierAWB || s.awb || s._id,
            labelUrl: s.labelUrl || null,
            trackingUrl: s.trackingUrl || null,
            merchantOrderRef: s.merchantOrderRef || '',
            velocityShipmentId: s.velocityShipmentId || '',
            velocityOrderId: s.velocityOrderId || '',
            subStatus: s.subStatus || '',
            shipmentType: s.shipmentType || '',
            estimatedDelivery: this.formatDateTime(s.estimatedDelivery || s.originalEstimatedDelivery),
            deliveredAt: this.formatDateTime(s.deliveredAt),
            customerName: s.destination?.name || '—',
            destination: `${s.destination?.city || ''}, ${s.destination?.state || ''}`,
            date: this.formatDateTime(s.createdAt),
            dateOnly: this.formatDatePart(s.createdAt),
            timeOnly: this.formatTimePart(s.createdAt),
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
            declaredWeight: s.declaredWeight,
            volumetricWeight: s.volumetricWeight,
            billingWeight: s.billingWeight,
            length: s.length,
            width: s.breadth,
            height: s.height,
            declaredValue: s.declaredValue,
            paymentMethod: s.paymentMethod || (s.isCOD ? 'COD' : 'PREPAID'),
            codAmount: s.codAmount || 0,
            orderItems: s.orderItems || [],
            productName: s.orderItems?.[0]?.productName || s.productName || s.itemType || 'Parcel',
            sku: s.orderItems?.[0]?.sku || '',
            itemType: s.itemType || 'Parcel',
            isFragile: s.isFragile || false,
            // QC and return fields
            rawDestination: s.destination,
            rawOrigin: s.origin,
            rawWarehouse: s.warehouseId,
            isReturn: s.isReturn || false,
            qcStatus: s.qcStatus || null,
            qcFailureReason: s.qcFailureReason || null,
            qcImages: s.qcImages || [],
            qcCheckedAt: this.formatDateTime(s.qcCheckedAt),
            timeline: (s.statusHistory || []).map((h: any) => ({
              title: h.status,
              date: this.formatDateTime(h.timestamp || h.updatedAt),
              status: 'completed'
            }))
          }));
        }
      },
      error: (err) => {
        this.shipments = [];
        this.shipmentListError = err?.error?.message || 'Failed to load shipments.';
      }
    });
  }

  applyShipmentSearch(): void {
    this.shipmentPage = 1;
    this.loadShipments();
  }

  clearShipmentSearch(): void {
    this.shipmentSearch = '';
    this.applyShipmentSearch();
  }

  nextShipmentPage(): void {
    if (!this.shipmentHasNextPage) return;
    this.shipmentPage += 1;
    this.loadShipments();
  }

  prevShipmentPage(): void {
    if (!this.shipmentHasPrevPage) return;
    this.shipmentPage -= 1;
    this.loadShipments();
  }

  get shipmentRangeStart(): number {
    if (!this.shipmentTotal) return 0;
    return ((this.shipmentPage - 1) * this.shipmentLimit) + 1;
  }

  get shipmentRangeEnd(): number {
    return Math.min(this.shipmentPage * this.shipmentLimit, this.shipmentTotal);
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
        this.errorMessage = getUserFriendlyError(err, 'Failed to load warehouse details.');
      }
    });
  }

  get totalAmount(): number {
    return this.couriers[this.selectedCourierIndex()]?.rate || 0;
  }

  errorMessage = '';

  openCreateModal(): void {
    this.router.navigate(['/merchant/create-shipment']);
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
                    rateEntry.merchantCost
                    ?? charges.total_forward_charges
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
          error: (err) => {
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
            this.errorMessage = getUserFriendlyError(err, 'Could not fetch live carrier rates. Charges will be calculated at booking.');
          },
        });
      },
      error: (err) => {
        this.isLoadingRates.set(false);
        this.errorMessage = getUserFriendlyError(err, 'Failed to check serviceability.');
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
      paymentMethod:    this.isCOD ? 'COD' : 'PREPAID',
      codAmount:        this.isCOD ? this.codAmount : 0,
      declaredValue:    this.declaredValue,
      productName:      this.productName,
      sku:              this.sku,
      quantity:         this.quantity,
      sellingPrice:     this.sellingPrice,
      discount:         this.discount,
      tax:              this.tax,
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
        this.errorMessage = getUserFriendlyError(err, 'Failed to create shipment. Please try again.');
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
      if (!this.productName.trim()) {
        this.errorMessage = 'Product name is required.';
        return false;
      }
      if (!this.sku.trim()) {
        this.errorMessage = 'SKU is required.';
        return false;
      }
      if (!this.quantity || this.quantity <= 0) {
        this.errorMessage = 'Quantity must be greater than zero.';
        return false;
      }
      if (this.sellingPrice < 0 || this.discount < 0 || this.tax < 0) {
        this.errorMessage = 'Selling price, discount, and tax cannot be negative.';
        return false;
      }
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
    if (!confirm('Cancel this shipment? This is only allowed before the shipment moves beyond order creation.')) return;
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
    this.isShipmentActionLoading.set(true);
    this.shipmentService.cancelShipment(id).pipe(
      finalize(() => this.isShipmentActionLoading.set(false)),
    ).subscribe({
      next: () => {
        this.closeDetailsModal();
        this.loadShipments();
        this.loadStats();
      },
      error: (err) => {
        this.errorMessage = getUserFriendlyError(err, 'Failed to cancel shipment.');
        this.shipmentActionError = this.errorMessage;
      },
    });
  }

  canCancelShipment(shipment: any): boolean {
    return shipment?.status === 'ORDER_CREATED';
  }

  canReattemptShipment(shipment: any): boolean {
    return shipment?.status === 'DELIVERY_FAILED' && Boolean(shipment?.carrierAWB || shipment?.awb);
  }

  canInitiateRto(shipment: any): boolean {
    return shipment?.status === 'DELIVERY_FAILED' && Boolean(shipment?.carrierAWB || shipment?.awb);
  }

  openNdrForm(): void {
    const shipment = this.selectedShipment();
    this.ndrAddressLine = shipment?.receiverAddress || '';
    this.ndrPhone = shipment?.receiverPhone || '';
    this.ndrLandmark = '';
    this.ndrComments = '';
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
    this.showNdrForm.set(true);
  }

  submitNdrReattempt(): void {
    const shipment = this.selectedShipment();
    if (!shipment || this.isShipmentActionLoading()) return;
    if (!this.ndrAddressLine.trim() && !this.ndrLandmark.trim() && !this.ndrPhone.trim() && !this.ndrComments.trim()) {
      this.shipmentActionError = 'Add updated address, phone, landmark, or comments for the reattempt.';
      return;
    }
    if (this.ndrPhone.trim() && !/^[6-9]\d{9}$/.test(this.ndrPhone.trim())) {
      this.shipmentActionError = 'Enter a valid 10-digit phone number.';
      return;
    }

    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
    this.isShipmentActionLoading.set(true);
    this.shipmentService.requestNdrReattempt({
      awb: shipment.carrierAWB || shipment.awb,
      updated_address: {
        ...(this.ndrAddressLine.trim() ? { address_line: this.ndrAddressLine.trim() } : {}),
        ...(this.ndrLandmark.trim() ? { landmark: this.ndrLandmark.trim() } : {}),
      },
      ...(this.ndrPhone.trim() ? { updated_phone_number: this.ndrPhone.trim() } : {}),
      ...(this.ndrComments.trim() ? { comments: this.ndrComments.trim() } : {}),
    }).pipe(finalize(() => this.isShipmentActionLoading.set(false))).subscribe({
      next: () => {
        this.shipmentActionSuccess = 'Delivery reattempt requested successfully.';
        this.showNdrForm.set(false);
        this.loadShipments();
        this.loadStats();
      },
      error: (err) => {
        this.shipmentActionError = getUserFriendlyError(err, 'Failed to request delivery reattempt.');
      },
    });
  }

  initiateRto(shipment: any): void {
    if (!confirm('Initiate RTO for this shipment?')) return;
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
    this.isShipmentActionLoading.set(true);
    this.shipmentService.initiateRto(shipment.carrierAWB || shipment.awb).pipe(
      finalize(() => this.isShipmentActionLoading.set(false)),
    ).subscribe({
      next: () => {
        this.shipmentActionSuccess = 'RTO initiated successfully.';
        this.loadShipments();
        this.loadStats();
      },
      error: (err) => {
        this.shipmentActionError = getUserFriendlyError(err, 'Failed to initiate RTO.');
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
    this.showNdrForm.set(false);
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
  }

  applyShipmentFilters(): void {
    this.shipmentPage = 1;
    this.loadShipments();
  }

  openReverseModal(shipment: any): void {
    this.closeDetailsModal();
    this.errorMessage = '';
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';

    const dest = shipment.rawDestination || {};
    this.reverseOrderId = `RET-VX-${shipment.awb}-${Date.now().toString().slice(-4)}`;
    this.reversePickupName = dest.name || shipment.customerName || '';
    this.reversePickupPhone = dest.phone || shipment.receiverPhone || '';
    this.reversePickupEmail = dest.email || shipment.receiverEmail || '';
    this.reversePickupAddress = dest.addressLine || '';
    this.reversePickupCity = dest.city || '';
    this.reversePickupState = dest.state || '';
    this.reversePickupPincode = dest.pincode || '';
    this.reversePickupCountry = dest.country || 'India';

    const whId = shipment.rawWarehouse?._id || shipment.rawWarehouse || '';
    const warehouse = this.warehouses.find(wh => this.getWarehouseOptionId(wh) === whId) || this.warehouses[0];
    if (warehouse) {
      this.reverseWarehouseMongoId = this.getWarehouseOptionId(warehouse);
      this.reverseWarehouseAddress = this.formatWarehouseAddress(warehouse);
    } else {
      this.reverseWarehouseMongoId = '';
      this.reverseWarehouseAddress = '';
    }

    this.reverseOrderItems = (shipment.orderItems || []).map((item: any) => ({
      name: item.productName || item.name || '',
      sku: item.sku || '',
      units: item.quantity || item.units || 1,
      selling_price: item.sellingPrice || item.selling_price || 0,
      discount: item.discount || 0,
      tax: item.tax || 0,
      qc_enable: false,
      qc_product_name: item.productName || item.name || '',
      qc_brand: '',
      qc_product_image: '',
    }));

    if (this.reverseOrderItems.length === 0) {
      this.reverseOrderItems.push({
        name: '',
        sku: '',
        units: 1,
        selling_price: 0,
        discount: 0,
        tax: 0,
        qc_enable: false,
        qc_product_name: '',
        qc_brand: '',
        qc_product_image: '',
      });
    }

    this.reverseLength = shipment.length || 10;
    this.reverseBreadth = shipment.width || shipment.breadth || 10;
    this.reverseHeight = shipment.height || 10;
    this.reverseWeight = shipment.weight || 0.5;
    this.reversePaymentMethod = 'PREPAID';

    this.calculateReverseSubTotal();
    this.showReverseModal.set(true);
  }

  closeReverseModal(): void {
    this.showReverseModal.set(false);
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';
  }

  selectReverseWarehouse(warehouseMongoId: string): void {
    const warehouse = this.warehouses.find(wh => this.getWarehouseOptionId(wh) === warehouseMongoId);
    if (warehouse) {
      this.reverseWarehouseMongoId = this.getWarehouseOptionId(warehouse);
      this.reverseWarehouseAddress = this.formatWarehouseAddress(warehouse);
    }
  }

  addReverseOrderItem(): void {
    this.reverseOrderItems.push({
      name: '',
      sku: '',
      units: 1,
      selling_price: 0,
      discount: 0,
      tax: 0,
      qc_enable: false,
      qc_product_name: '',
      qc_brand: '',
      qc_product_image: '',
    });
    this.calculateReverseSubTotal();
  }

  calculateReverseSubTotal(): void {
    const total = this.reverseOrderItems.reduce((sum, item) => {
      const price = Number(item.selling_price || 0);
      const qty = Number(item.units || 0);
      const disc = Number(item.discount || 0);
      const tx = Number(item.tax || 0);
      return sum + (price * qty - disc + tx);
    }, 0);
    this.reverseSubTotal = Math.max(0, total);
  }

  submitReversePickup(): void {
    this.shipmentActionError = '';
    this.shipmentActionSuccess = '';

    if (!this.reversePickupName.trim() || !this.reversePickupPhone.trim() || !this.reversePickupAddress.trim() || !this.reversePickupCity.trim() || !this.reversePickupState.trim() || !this.reversePickupPincode.trim()) {
      this.shipmentActionError = 'All pickup customer fields are required.';
      return;
    }

    if (!/^\d{6}$/.test(this.reversePickupPincode.trim())) {
      this.shipmentActionError = 'Enter a valid 6-digit pincode.';
      return;
    }

    if (!/^[6-9]\d{9}$/.test(this.reversePickupPhone.trim())) {
      this.shipmentActionError = 'Enter a valid 10-digit phone number.';
      return;
    }

    const warehouse = this.warehouses.find(wh => this.getWarehouseOptionId(wh) === this.reverseWarehouseMongoId);
    if (!warehouse) {
      this.shipmentActionError = 'Selected destination warehouse not found.';
      return;
    }

    if (this.reverseOrderItems.length === 0) {
      this.shipmentActionError = 'At least one order item is required.';
      return;
    }

    for (const item of this.reverseOrderItems) {
      if (!item.name.trim()) {
        this.shipmentActionError = 'Item product name is required.';
        return;
      }
      if (!item.sku.trim()) {
        this.shipmentActionError = 'Item SKU is required.';
        return;
      }
      if (item.units <= 0) {
        this.shipmentActionError = 'Item quantity must be greater than zero.';
        return;
      }
      if (item.qc_enable) {
        if (!item.qc_product_image.trim()) {
          this.shipmentActionError = `QC image URL is required for QC-enabled item: ${item.name}`;
          return;
        }
      }
    }

    const qcCount = this.reverseOrderItems.filter(item => item.qc_enable).length;
    if (qcCount > 0 && this.reverseOrderItems.length > 2) {
      this.shipmentActionError = 'QC return shipments cannot have more than 2 items. Reduce item count or disable QC check.';
      return;
    }

    const payload = {
      warehouseId: this.reverseWarehouseMongoId,
      orderId: this.reverseOrderId || undefined,
      paymentMethod: 'PREPAID',
      pickupFirstName: this.reversePickupName.split(' ')[0] || this.reversePickupName,
      pickupLastName: this.reversePickupName.split(' ').slice(1).join(' ') || '',
      pickupPhone: this.reversePickupPhone,
      pickupEmail: this.reversePickupEmail || undefined,
      pickupAddress: this.reversePickupAddress,
      pickupCity: this.reversePickupCity,
      pickupState: this.reversePickupState,
      pickupPincode: this.reversePickupPincode,
      pickupCountry: this.reversePickupCountry || 'India',

      shippingFirstName: warehouse.contactPerson,
      shippingLastName: '',
      shippingPhone: warehouse.phone || '9999999999',
      shippingEmail: warehouse.email || '',
      shippingAddress: warehouse.address,
      shippingCity: warehouse.city,
      shippingState: warehouse.state,
      shippingPincode: warehouse.pincode,

      orderItems: this.reverseOrderItems.map(item => ({
        name: item.name.trim(),
        sku: item.sku.trim(),
        units: Number(item.units),
        selling_price: Number(item.selling_price),
        discount: Number(item.discount || 0),
        tax: Number(item.tax || 0),
        qc_enable: Boolean(item.qc_enable),
        qc_product_name: item.qc_product_name.trim() || item.name.trim(),
        qc_brand: item.qc_brand.trim() || undefined,
        qc_product_image: item.qc_product_image.trim() || undefined,
      })),

      subTotal: Number(this.reverseSubTotal),
      totalDiscount: Number(this.reverseOrderItems.reduce((sum, item) => sum + Number(item.discount || 0), 0)),
      length: Number(this.reverseLength),
      breadth: Number(this.reverseBreadth),
      height: Number(this.reverseHeight),
      weight: Number(this.reverseWeight),
    };

    this.isShipmentActionLoading.set(true);
    this.shipmentService.createReverseShipment(payload).pipe(
      finalize(() => this.isShipmentActionLoading.set(false))
    ).subscribe({
      next: (res) => {
        this.shipmentActionSuccess = 'Reverse pickup booked successfully!';
        this.loadShipments();
        this.loadStats();
        setTimeout(() => {
          this.closeReverseModal();
        }, 1500);
      },
      error: (err) => {
        this.shipmentActionError = getUserFriendlyError(err, 'Failed to book reverse pickup.');
      }
    });
  }
}
