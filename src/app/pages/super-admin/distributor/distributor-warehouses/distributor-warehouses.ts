import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-distributor-warehouses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distributor-warehouses.html',
  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorWarehouses {

  warehouses = [
    {
      id: 1,
      name: 'Mumbai Central Warehouse',
      city: 'Mumbai',
      manager: 'Rahul Sharma',
      capacity: '5000 Sq Ft',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Pune Warehouse',
      city: 'Pune',
      manager: 'Amit Verma',
      capacity: '3500 Sq Ft',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Nagpur Warehouse',
      city: 'Nagpur',
      manager: 'Sanjay Gupta',
      capacity: '2500 Sq Ft',
      status: 'Inactive'
    }
  ];

}