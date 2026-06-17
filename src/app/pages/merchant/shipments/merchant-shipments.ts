import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merchant-shipments',
  standalone: true,
  imports: [CommonModule, StatsCards, RouterLink, FormsModule],
  templateUrl: './merchant-shipments.html',
  styleUrl: './merchant-shipments.css',
})
export class MerchantShipments {
  shipmentCards = [
    {
      title: 'Total Shipments',
      value: '5',
      icon: 'fas fa-boxes',
      bgColor: '#dbeafe',
      iconColor: '#2563eb',
      percentage: 12,
      symbol: '+',
      compairTo: 'vs last month'
    },
    {
      title: 'In Transit',
      value: '1',
      icon: 'fas fa-truck-moving',
      bgColor: '#fef3c7',
      iconColor: '#d97706',
      percentage: 5,
      symbol: '+',
      compairTo: 'currently moving'
    },
    {
      title: 'Delivered',
      value: '2',
      icon: 'fas fa-check-circle',
      bgColor: '#dcfce7',
      iconColor: '#16a34a',
      percentage: 18,
      symbol: '+',
      compairTo: 'successful deliveries'
    },
    {
      title: 'Pending Pickup',
      value: '1',
      icon: 'fas fa-store',
      bgColor: '#ede9fe',
      iconColor: '#7c3aed',
      percentage: 3,
      symbol: '-',
      compairTo: 'awaiting pickup'
    },
    {
      title: 'RTO',
      value: '1',
      icon: 'fas fa-undo-alt',
      bgColor: '#fee2e2',
      iconColor: '#dc2626',
      percentage: 2,
      symbol: '-',
      compairTo: 'returned orders'
    },
    {
      title: 'Delivered Today',
      value: '1',
      icon: 'fas fa-calendar-check',
      bgColor: '#cffafe',
      iconColor: '#0891b2',
      percentage: 9,
      symbol: '+',
      compairTo: 'today'
    },
    {
      title: 'Total Shipping Cost',
      value: '₹6,210',
      icon: 'fas fa-money-bill-wave',
      bgColor: '#fef9c3',
      iconColor: '#ca8a04',
      percentage: 7,
      symbol: '+',
      compairTo: 'this month'
    },
    {
      title: 'Average Delivery Time',
      value: '3.2 Days',
      icon: 'fas fa-clock',
      bgColor: '#e0f2fe',
      iconColor: '#0284c7',
      percentage: 6,
      symbol: '-',
      compairTo: 'faster than last month'
    }
  ];

  shipments: any[] = [
    {
      id: 'VX-1092',
      customerName: 'Aarav Mehta',
      destination: 'Mumbai, MH',
      date: '16 Jun 2026',
      amount: '₹2,450',
      status: 'In Transit',
      courier: 'Blue Dart',
      pickupContact: 'Rahul Sharma',
      pickupPhone: '9876543210',
      pickupAddress: 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
      receiverPhone: '9123456789',
      receiverEmail: 'aarav@mehta.com',
      receiverAddress: 'Flat 402, Sea Breeze Apts, Juhu Tara Road, Mumbai, Maharashtra - 400049',
      weight: 3.5,
      length: 25,
      width: 20,
      height: 15,
      itemType: 'Electronics',
      isFragile: true,
      timeline: [
        { title: 'Shipment Created', date: '16 Jun 2026 10:15 AM', status: 'completed' },
        { title: 'Picked Up by Courier', date: '16 Jun 2026 02:30 PM', status: 'completed' },
        { title: 'In Transit', date: '16 Jun 2026 06:45 PM', status: 'active' },
        { title: 'Out for Delivery', date: '', status: 'pending' },
        { title: 'Delivered', date: '', status: 'pending' }
      ]
    },
    {
      id: 'VX-1091',
      customerName: 'Ishaan Sharma',
      destination: 'Delhi, DL',
      date: '15 Jun 2026',
      amount: '₹1,200',
      status: 'Delivered',
      courier: 'Delhivery',
      pickupContact: 'Rahul Sharma',
      pickupPhone: '9876543210',
      pickupAddress: 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
      receiverPhone: '9876543200',
      receiverEmail: 'ishaan@sharma.com',
      receiverAddress: 'Pocket D-12, Flat 45, Sector 8, Rohini, New Delhi - 110085',
      weight: 1.2,
      length: 15,
      width: 15,
      height: 12,
      itemType: 'Apparel',
      isFragile: false,
      timeline: [
        { title: 'Shipment Created', date: '15 Jun 2026 09:00 AM', status: 'completed' },
        { title: 'Picked Up by Courier', date: '15 Jun 2026 11:15 AM', status: 'completed' },
        { title: 'In Transit', date: '15 Jun 2026 04:30 PM', status: 'completed' },
        { title: 'Out for Delivery', date: '16 Jun 2026 09:15 AM', status: 'completed' },
        { title: 'Delivered', date: '16 Jun 2026 12:40 PM', status: 'completed' }
      ]
    },
    {
      id: 'VX-1090',
      customerName: 'Ananya Goel',
      destination: 'Bangalore, KA',
      date: '15 Jun 2026',
      amount: '₹3,850',
      status: 'Pending',
      courier: 'DTDC',
      pickupContact: 'Rahul Sharma',
      pickupPhone: '9876543210',
      pickupAddress: 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
      receiverPhone: '9988776655',
      receiverEmail: 'ananya@goel.com',
      receiverAddress: '12th Cross, Indiranagar, Bangalore, Karnataka - 560038',
      weight: 5.0,
      length: 30,
      width: 30,
      height: 20,
      itemType: 'Medicines',
      isFragile: false,
      timeline: [
        { title: 'Shipment Created', date: '15 Jun 2026 05:20 PM', status: 'active' },
        { title: 'Picked Up by Courier', date: '', status: 'pending' },
        { title: 'In Transit', date: '', status: 'pending' },
        { title: 'Out for Delivery', date: '', status: 'pending' },
        { title: 'Delivered', date: '', status: 'pending' }
      ]
    },
    {
      id: 'VX-1089',
      customerName: 'Kabir Verma',
      destination: 'Pune, MH',
      date: '14 Jun 2026',
      amount: '₹890',
      status: 'Delivered',
      courier: 'XpressBees',
      pickupContact: 'Rahul Sharma',
      pickupPhone: '9876543210',
      pickupAddress: 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
      receiverPhone: '9112233445',
      receiverEmail: 'kabir@verma.com',
      receiverAddress: 'Flat 12, Tower B, Amanora Park Town, Hadapsar, Pune - 411028',
      weight: 0.8,
      length: 10,
      width: 10,
      height: 8,
      itemType: 'Documents',
      isFragile: false,
      timeline: [
        { title: 'Shipment Created', date: '14 Jun 2026 08:30 AM', status: 'completed' },
        { title: 'Picked Up by Courier', date: '14 Jun 2026 11:00 AM', status: 'completed' },
        { title: 'In Transit', date: '14 Jun 2026 03:00 PM', status: 'completed' },
        { title: 'Out for Delivery', date: '15 Jun 2026 10:00 AM', status: 'completed' },
        { title: 'Delivered', date: '15 Jun 2026 01:15 PM', status: 'completed' }
      ]
    },
    {
      id: 'VX-1088',
      customerName: 'Diya Patel',
      destination: 'Ahmedabad, GJ',
      date: '13 Jun 2026',
      amount: '₹1,670',
      status: 'RTO',
      courier: 'Ecom Express',
      pickupContact: 'Rahul Sharma',
      pickupPhone: '9876543210',
      pickupAddress: 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
      receiverPhone: '9900112233',
      receiverEmail: 'diya@patel.com',
      receiverAddress: 'Shanti Sadan Apts, CG Road, Ahmedabad, Gujarat - 380009',
      weight: 2.2,
      length: 20,
      width: 18,
      height: 12,
      itemType: 'Parcel',
      isFragile: true,
      timeline: [
        { title: 'Shipment Created', date: '13 Jun 2026 10:00 AM', status: 'completed' },
        { title: 'Picked Up by Courier', date: '13 Jun 2026 01:30 PM', status: 'completed' },
        { title: 'In Transit', date: '14 Jun 2026 09:00 AM', status: 'completed' },
        { title: 'Delivery Attempt Failed', date: '15 Jun 2026 02:00 PM', status: 'completed' },
        { title: 'Returned to Origin (RTO)', date: '16 Jun 2026 11:00 AM', status: 'active' }
      ]
    }
  ];

  // Modal visibility
  showCreateModal = signal(false);
  showDetailsModal = signal(false);

  // Selected shipment details
  selectedShipment = signal<any>(null);

  // Wizard active step
  currentStep = signal(1);

  // Form input properties
  pickupAddress = 'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301';
  pickupContact = 'Rahul Sharma';
  pickupPhone = '9876543210';
  pickupEmail = 'rahul@vasamostore.com';

  addresses = [
    'Vasamo Store, 123, Sector 5, Noida, Uttar Pradesh - 201301',
    'Warehouse Alpha, Plot 45, Udyog Vihar, Gurugram, Haryana - 122008',
    'Retail Hub, Shop 12, Connaught Place, New Delhi - 110001'
  ];

  receiverName = 'Ankit Verma';
  receiverPhone = '9876543211';
  receiverEmail = 'ankit@example.com';
  receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
  receiverPincode = '110001';
  receiverCity = 'Delhi';
  receiverState = 'Delhi';

  weight = 2.5;
  length = 20;
  width = 15;
  height = 10;
  itemType = 'Documents';
  isFragile = false;

  itemTypes = ['Documents', 'Parcel', 'Electronics', 'Apparel', 'Medicines'];

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

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.currentStep.set(1);
    this.selectedCourierIndex.set(0);
    // Reset form values to defaults
    this.receiverName = 'Ankit Verma';
    this.receiverPhone = '9876543211';
    this.receiverAddress = 'Block C-4, Flat 102, Janakpuri, New Delhi';
    this.receiverPincode = '110001';
    this.receiverCity = 'Delhi';
    this.receiverState = 'Delhi';
    this.weight = 2.5;
    this.length = 20;
    this.width = 15;
    this.height = 10;
    this.itemType = 'Documents';
    this.isFragile = false;
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
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
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  addNewAddress(): void {
    alert('Add New Address feature coming soon!');
  }

  createShipment(): void {
    const selected = this.couriers[this.selectedCourierIndex()];
    const trackingId = 'VX-' + Math.floor(1000 + Math.random() * 9000);
    
    // Add new shipment record
    this.shipments.unshift({
      id: trackingId,
      customerName: this.receiverName,
      destination: `${this.receiverCity}, ${this.receiverState.substring(0, 2).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      amount: `₹${selected.rate.toFixed(2)}`,
      status: 'Pending',
      courier: selected.name
    });

    // Update stats cards values dynamically
    const totalCount = parseInt(this.shipmentCards[0].value) + 1;
    this.shipmentCards[0].value = totalCount.toString();

    const pendingCount = parseInt(this.shipmentCards[3].value) + 1;
    this.shipmentCards[3].value = pendingCount.toString();

    alert(`Shipment ${trackingId} created successfully!`);
    this.closeCreateModal();
  }

  viewShipmentDetails(shipment: any): void {
    if (!shipment.timeline) {
      shipment.pickupContact = this.pickupContact;
      shipment.pickupPhone = this.pickupPhone;
      shipment.pickupAddress = this.pickupAddress;
      shipment.receiverPhone = this.receiverPhone;
      shipment.receiverEmail = 'customer@example.com';
      shipment.receiverAddress = '123 Rajouri Garden, Block B, New Delhi - 110001';
      shipment.weight = this.weight;
      shipment.length = this.length;
      shipment.width = this.width;
      shipment.height = this.height;
      shipment.itemType = this.itemType;
      shipment.isFragile = this.isFragile;
      shipment.timeline = [
        { title: 'Shipment Created', date: shipment.date + ' 10:00 AM', status: 'completed' },
        { title: 'Picked Up by Courier', date: '', status: 'pending' },
        { title: 'In Transit', date: '', status: 'pending' },
        { title: 'Out for Delivery', date: '', status: 'pending' },
        { title: 'Delivered', date: '', status: 'pending' }
      ];
    }
    this.selectedShipment.set(shipment);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedShipment.set(null);
  }
}
