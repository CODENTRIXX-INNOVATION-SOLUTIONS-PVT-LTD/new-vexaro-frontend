import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-shipment-overview',
  imports: [],
  templateUrl: './shipment-overview.html',
  styleUrl: './shipment-overview.css'
})
export class ShipmentOverview implements AfterViewInit {

  ngAfterViewInit() {

    new Chart("shipmentChart", {
      type: 'line',
      data: {
        labels: [
          '01 May',
          '05 May',
          '10 May',
          '15 May',
          '20 May',
          '25 May',
          '30 May'
        ],
        datasets: [
          {
            label: 'Delivered',
            data: [4000,6000,4500,5500,5000,8000,7600]
          },
          {
            label: 'In Transit',
            data: [2000,3500,2500,3200,2800,4500,3600]
          },
          {
            label: 'Pending',
            data: [800,1800,900,1200,1000,2000,1300]
          }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false
      }
    });

  }

}