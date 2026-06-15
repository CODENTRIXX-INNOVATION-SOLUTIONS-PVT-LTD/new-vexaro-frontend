import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-registrations',
  standalone: true,
  templateUrl: './recent-registrations.html',
  styleUrl: '../../common-css/super-admin-dashboard-page-bottom-table.css'
})
export class RecentRegistrations {

  registrations = [
    {
      id: 'REG001',
      name: 'Rahul Sharma',
      role: 'Merchant',
      email: 'rahul@gmail.com',
      date: '10 Jun 2026'
    },
    {
      id: 'REG002',
      name: 'Priya Singh',
      role: 'Distributor',
      email: 'priya@gmail.com',
      date: '10 Jun 2026'
    },
    {
      id: 'REG003',
      name: 'Amit Verma',
      role: 'Warehouse',
      email: 'amit@gmail.com',
      date: '09 Jun 2026'
    },
    {
      id: 'REG004',
      name: 'Neha Gupta',
      role: 'Merchant',
      email: 'neha@gmail.com',
      date: '09 Jun 2026'
    },
    {
      id: 'REG005',
      name: 'Rohan Patel',
      role: 'Distributor',
      email: 'rohan@gmail.com',
      date: '08 Jun 2026'
    }
  ];

}