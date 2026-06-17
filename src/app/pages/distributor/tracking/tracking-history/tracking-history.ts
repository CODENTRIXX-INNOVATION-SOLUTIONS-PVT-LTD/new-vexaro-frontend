import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  coordinates: string;
  deviceInfo: string;
  status: string;
}

@Component({
  selector: 'app-tracking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-history.html',
  styleUrl: './tracking-history.css'
})
export class TrackingHistory implements OnInit {
  awb: string = '';
  logs: AuditEvent[] = [];
  filteredLogs: AuditEvent[] = [];

  dateFilter: string = '';
  statusFilter: string = 'All';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.awb = params['awb'] || 'VEX-DEMO';
      this.loadDummyData();
      this.applyFilters();
    });
  }

  loadDummyData() {
    this.logs = [
      { id: 'LOG-005', timestamp: '2026-06-16 08:30:12', action: 'Status Update: OUT_FOR_DELIVERY', actor: 'System (Auto)', coordinates: '19.0760° N, 72.8777° E', deviceInfo: 'Server', status: 'Out for Delivery' },
      { id: 'LOG-004', timestamp: '2026-06-16 06:05:00', action: 'Assigned to Route 4', actor: 'Dispatcher Rahul', coordinates: 'Hub Coordinates', deviceInfo: 'Web Panel IP: 10.0.x.x', status: 'Sorted' },
      { id: 'LOG-003', timestamp: '2026-06-15 21:45:33', action: 'Bag Unsealed & Scanned In', actor: 'Scanner ID 402', coordinates: 'Hub Coordinates', deviceInfo: 'Zebra MC9300', status: 'Received at Hub' },
      { id: 'LOG-002', timestamp: '2026-06-15 16:15:10', action: 'Pickup Complete', actor: 'Driver Amit', coordinates: '19.1136° N, 72.8697° E', deviceInfo: 'Android App v2.1', status: 'Picked Up' },
      { id: 'LOG-001', timestamp: '2026-06-15 10:00:05', action: 'AWB Generated', actor: 'Merchant API', coordinates: 'N/A', deviceInfo: 'API v1', status: 'Manifested' },
    ];
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      const matchesDate = !this.dateFilter || log.timestamp.includes(this.dateFilter);
      const matchesStatus = this.statusFilter === 'All' || log.status === this.statusFilter;
      return matchesDate && matchesStatus;
    });
  }

  goBack() {
    this.router.navigate(['/distributor/tracking/search']);
  }
}
