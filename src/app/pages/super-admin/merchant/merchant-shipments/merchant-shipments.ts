import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-shipments',
  imports: [],
  templateUrl: './merchant-shipments.html',
  styleUrl: './merchant-shipments.css',
})
export class MerchantShipments {

  shipments = [
    {
      shipmentId: 'SHP-1001',
      orderId: 'ORD-501',
      destination: 'Mumbai',
      dispatchDate: '15 Jun 2026',
      status: 'Delivered'
    },
    {
      shipmentId: 'SHP-1002',
      orderId: 'ORD-502',
      destination: 'Delhi',
      dispatchDate: '14 Jun 2026',
      status: 'In Transit'
    },
    {
      shipmentId: 'SHP-1003',
      orderId: 'ORD-503',
      destination: 'Bangalore',
      dispatchDate: '13 Jun 2026',
      status: 'Pending'
    }
  ];

}