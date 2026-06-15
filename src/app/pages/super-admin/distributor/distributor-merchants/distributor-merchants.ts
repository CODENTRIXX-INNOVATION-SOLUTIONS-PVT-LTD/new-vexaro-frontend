import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-distributor-merchants',
  imports: [CommonModule],
  templateUrl: './distributor-merchants.html',

  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorMerchants {
  merchants = [
  {
    id: 1,
    name: 'Fashion Hub',
    city: 'Mumbai',
    owner: 'Raj Mehta',
    orders: 145,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Urban Trends',
    city: 'Pune',
    owner: 'Amit Shah',
    orders: 92,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Style Store',
    city: 'Nagpur',
    owner: 'Neha Singh',
    orders: 38,
    status: 'Inactive'
  }
];

}
