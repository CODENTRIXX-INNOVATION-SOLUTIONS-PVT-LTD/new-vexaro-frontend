import { AfterViewInit, Component } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart-section',
  standalone: true,
  imports: [],
  templateUrl: './chart-section.html',
  styleUrl: './chart-section.css',
})
export class ChartSection implements AfterViewInit {

  ngAfterViewInit(): void {

    // Line Chart
    new Chart('shipmentChart', {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Pending',
            data: [80, 95, 70, 110, 90, 120, 100],
            borderColor: '#ff9800',
            backgroundColor: '#ff9800',
            tension: 0.4
          },
          {
            label: 'Delivered',
            data: [120, 180, 140, 220, 170, 250, 210],
            borderColor: '#4caf50',
            backgroundColor: '#4caf50',
            tension: 0.4
          },
          {
            label: 'In Process',
            data: [60, 85, 75, 100, 95, 130, 115],
            borderColor: '#2196f3',
            backgroundColor: '#2196f3',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    // Pie Chart
    new Chart('courierPieChart', {
      type: 'pie',
      data: {
        labels: ['BlueDart', 'Delhivery', 'DTDC'],
        datasets: [{
          data: [45, 30, 25]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }
}