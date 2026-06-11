import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-delivery-by-status',
  imports: [],
  templateUrl: './delivery-by-status.html',
  styleUrl: './delivery-by-status.css',
})
export class DeliveryByStatus implements AfterViewInit {

  ngAfterViewInit(): void {
    new Chart('courierPieChart', {
      type: 'pie',
      data: {
        labels: ['Delivered', 'Pending', 'Cancelled'],
        datasets: [
          {
            data: [65, 25, 10],
            backgroundColor: [
              '#22c55e', // Green
              '#f59e0b', // Orange
              '#ef4444'  // Red
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}