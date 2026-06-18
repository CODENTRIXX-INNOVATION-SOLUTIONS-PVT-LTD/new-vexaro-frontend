import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PickupSchedule {
  id: string;
  date: string;
  time: string;
  awbCount: number;
  status: 'Scheduled' | 'Completed' | 'Missed';
  rider: string;
}

@Component({
  selector: 'app-merchant-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-warehouse.html',
  styleUrl: './merchant-warehouse.css',
})
export class MerchantWarehouse {

  // ─── Sub-Navigation Tabs ──────────────────────────────────────────────────
  tabs = [
    { id: 'overview',   label: 'Warehouse Overview',   icon: 'fas fa-warehouse' },
    { id: 'address',    label: 'Pickup Address',      icon: 'fas fa-map-location-dot' },
    { id: 'statistics', label: 'Warehouse Statistics', icon: 'fas fa-chart-line' },
    { id: 'timings',    label: 'Pickup Timings',       icon: 'fas fa-clock' },
    { id: 'couriers',   label: 'Courier Partners',     icon: 'fas fa-truck-fast' },
    { id: 'shipments',  label: 'Recent Shipments',     icon: 'fas fa-box-archive' },
    { id: 'documents',  label: 'Documents',            icon: 'fas fa-file-invoice' },
    { id: 'edit',       label: 'Edit Warehouse',       icon: 'fas fa-pen-to-square' },
  ];
  
  activeTab: string = 'overview';
  saveSuccess: boolean = false;

  // ─── Warehouse Details ────────────────────────────────────────────────────
  warehouse = {
    warehouseId: 'WH66DU',
    warehouseName: 'Raj Courier Warehouse',
    contactPerson: 'Arun Mehra',
    contactPhone: '9000112233',
    contactEmail: 'arun.mehra@speedx.in',
    pickupAddress: 'Plot 14, Industrial Area, Near Nadra Bus Stand',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462021',
    assignedDate: '15 Mar 2024',
    assignedBy: 'SpeedX Logistics',
    distributorPhone: '9111222333',
    operatingHours: 'Mon – Sat, 9:00 AM – 7:00 PM',
    status: 'Active',
  };

  // ─── Edit Form Model ──────────────────────────────────────────────────────
  editForm = {
    contactPerson: 'Arun Mehra',
    contactPhone: '9000112233',
    contactEmail: 'arun.mehra@speedx.in',
    operatingHours: 'Mon – Sat, 9:00 AM – 7:00 PM',
    specialInstructions: 'Gate 3, use basement ramp for heavy vehicles. Deliveries are only accepted during operating hours.',
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  stats = [
    { label: 'Total Pickups',    value: '1,248',  icon: 'fas fa-box',          color: 'blue'   },
    { label: 'This Month',       value: '142',    icon: 'fas fa-calendar-days', color: 'purple' },
    { label: 'Completed Today',  value: '8',      icon: 'fas fa-circle-check', color: 'green'  },
    { label: 'Pending Pickups',  value: '3',      icon: 'fas fa-clock',        color: 'amber'  },
  ];

  // ─── Pickup Schedule ──────────────────────────────────────────────────────
  pickups: PickupSchedule[] = [
    { id: 'PKP001', date: '17 Jun 2026', time: '10:30 AM', awbCount: 12, status: 'Completed', rider: 'Ramesh K.' },
    { id: 'PKP002', date: '17 Jun 2026', time: '3:00 PM',  awbCount: 8,  status: 'Scheduled', rider: 'Suresh P.' },
    { id: 'PKP003', date: '16 Jun 2026', time: '11:00 AM', awbCount: 15, status: 'Completed', rider: 'Ramesh K.' },
    { id: 'PKP004', date: '15 Jun 2026', time: '2:00 PM',  awbCount: 6,  status: 'Missed',    rider: 'Suresh P.' },
    { id: 'PKP005', date: '14 Jun 2026', time: '10:00 AM', awbCount: 20, status: 'Completed', rider: 'Ramesh K.' },
    { id: 'PKP006', date: '13 Jun 2026', time: '4:00 PM',  awbCount: 9,  status: 'Completed', rider: 'Deepak M.' },
  ];

  // ─── Pickup Timings Data ──────────────────────────────────────────────────
  timings = {
    slots: [
      { id: 'slot1', name: 'Morning Pickup Slot', range: '10:00 AM - 1:00 PM', active: true, type: 'Primary' },
      { id: 'slot2', name: 'Afternoon Pickup Slot', range: '2:00 PM - 5:00 PM', active: true, type: 'Secondary' },
      { id: 'slot3', name: 'Late Evening Express Slot', range: '6:00 PM - 8:00 PM', active: false, type: 'Ad-hoc' }
    ],
    cutoffTime: '2:00 PM for same-day dispatch',
    operationalDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    nextScheduledPickup: {
      date: 'Today, 17 Jun 2026',
      time: '3:00 PM',
      rider: 'Suresh P. (SpeedX)'
    }
  };

  // ─── Courier Partners Data ────────────────────────────────────────────────
  couriers = [
    { name: 'SpeedX Logistics', status: 'Active', priority: 1, type: 'Express & Surface', code: 'SPX' },
    { name: 'Delhivery Surface', status: 'Active', priority: 2, type: 'Surface', code: 'DEL_SUR' },
    { name: 'BlueDart Express', status: 'Active', priority: 3, type: 'Air / Express', code: 'BD_EXP' },
    { name: 'Xpressbees Lite', status: 'Active', priority: 4, type: 'Surface', code: 'XB_LITE' },
    { name: 'Shadowfax Hyperlocal', status: 'Inactive', priority: 5, type: 'Hyperlocal', code: 'SF_HYP' }
  ];

  // ─── Recent Shipments Data ────────────────────────────────────────────────
  recentShipments = [
    { awb: 'VEX-889102-IN', date: '17 Jun 2026', destination: 'Mumbai, MH', courier: 'SpeedX Logistics', weight: '1.2 kg', status: 'In Transit' },
    { awb: 'VEX-889098-IN', date: '17 Jun 2026', destination: 'Delhi, DL', courier: 'Delhivery Surface', weight: '3.5 kg', status: 'Dispatched' },
    { awb: 'VEX-889012-IN', date: '16 Jun 2026', destination: 'Bangalore, KA', courier: 'BlueDart Express', weight: '0.8 kg', status: 'Delivered' },
    { awb: 'VEX-888995-IN', date: '16 Jun 2026', destination: 'Bhopal, MP', courier: 'SpeedX Logistics', weight: '2.0 kg', status: 'Delivered' },
    { awb: 'VEX-888842-IN', date: '15 Jun 2026', destination: 'Ahmedabad, GJ', courier: 'Xpressbees Lite', weight: '5.4 kg', status: 'RTO Pending' },
    { awb: 'VEX-888711-IN', date: '14 Jun 2026', destination: 'Pune, MH', courier: 'BlueDart Express', weight: '1.5 kg', status: 'Delivered' }
  ];

  // ─── Documents Data ──────────────────────────────────────────────────────
  documents = [
    { name: 'GST Registration Certificate', type: 'PDF', size: '2.4 MB', uploadDate: '16 Mar 2024', status: 'Verified' },
    { name: 'Cancelled Cheque (Bank Details)', type: 'Image', size: '1.1 MB', uploadDate: '16 Mar 2024', status: 'Verified' },
    { name: 'Warehouse Rental Agreement', type: 'PDF', size: '4.8 MB', uploadDate: '16 Mar 2024', status: 'Verified' },
    { name: 'Electricity Bill (Address Proof)', type: 'PDF', size: '1.8 MB', uploadDate: '18 Mar 2024', status: 'Under Review' }
  ];

  // ─── Methods ──────────────────────────────────────────────────────────────
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  saveWarehouse() {
    // Save details to primary warehouse properties
    this.warehouse.contactPerson = this.editForm.contactPerson;
    this.warehouse.contactPhone = this.editForm.contactPhone;
    this.warehouse.contactEmail = this.editForm.contactEmail;
    this.warehouse.operatingHours = this.editForm.operatingHours;
    
    // Simulate save status toast
    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }
}
