import { AfterViewInit, Component, inject } from '@angular/core';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  templateUrl: './revenue-chart.html',
  styleUrl: './revenue-chart.css'
})
export class RevenueChart implements AfterViewInit {
  private dashboardService = inject(DashboardService);

  ngAfterViewInit(): void {
    this.dashboardService.getRevenueChartData().subscribe({
      next: (chartData) => {
        this.renderChart(chartData);
      },
      error: (error) => {
        console.error('Error fetching revenue chart data:', error);
        // Fallback to empty chart on error
        this.renderChart({
          labels: ['No Data'],
          datasets: [{ label: 'Revenue', data: [0], backgroundColor: 'rgb(11, 74, 111)', borderRadius: 8 }]
        });
      }
    });
  }

  private renderChart(data: any): void {
    new Chart('revenueChart', {
      type: 'bar',
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
}