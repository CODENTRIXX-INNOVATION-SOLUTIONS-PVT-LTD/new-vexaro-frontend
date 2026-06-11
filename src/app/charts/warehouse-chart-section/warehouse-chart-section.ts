import { AfterViewInit, Component } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-warehouse-chart-section',
  imports: [],
  templateUrl: './warehouse-chart-section.html',
  styleUrl: './warehouse-chart-section.css',
})
export class WarehouseChartSectionimplements implements AfterViewInit {

  ngAfterViewInit(): void {

    // Line Chart
    new Chart('shipmentChart', {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Inbound',
            data: [80, 95, 70, 110, 90, 120, 100],
            borderColor: '#9b53ff',
            backgroundColor: '#9d58fd',
            tension: 0.4
          },
          {
            label: 'Outboud',
            data: [120, 180, 140, 220, 170, 250, 210],
            borderColor:'#5d00df',
            backgroundColor: '#5b00dc',
            tension: 0.4
          },
          
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
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [{
      data: [45, 30, 25],
      backgroundColor: [
        '#22c55e', // Green
        '#f59e0b', // Orange
        '#ef4444'  // Red
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 12
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12
      }
    }
  }
});

  }
}