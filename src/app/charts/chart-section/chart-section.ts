import { AfterViewInit, Component, inject } from '@angular/core';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-chart-section',
  standalone: true,
  imports: [],
  templateUrl: './chart-section.html',
  styleUrl: './chart-section.css',
})
export class ChartSection implements AfterViewInit {
  private dashboardService = inject(DashboardService);

  ngAfterViewInit(): void {
    this.dashboardService.getShipmentChartData().subscribe({
      next: ({ lineChart, pieChart }) => {
        this.renderLineChart(lineChart);
        this.renderPieChart(pieChart);
      },
      error: (error) => {
        console.error('Error fetching chart data:', error);
        // Fallback to empty charts on error
        this.renderLineChart({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ label: 'Shipments', data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#2196f3', backgroundColor: '#2196f3', tension: 0.4 }]
        });
        this.renderPieChart({ labels: ['No Data'], data: [1] });
      }
    });
  }

  private renderLineChart(data: any): void {
    new Chart('shipmentChart', {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets
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
  }

  private renderPieChart(data: any): void {
    new Chart('courierPieChart', {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}