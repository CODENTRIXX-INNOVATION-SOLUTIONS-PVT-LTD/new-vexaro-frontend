import { Component, AfterViewInit, Input, OnChanges } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-top-destinations',
  imports: [],
  templateUrl: './top-destinations.html',
  styleUrl: './top-destinations.css'
})
export class TopDestinations implements AfterViewInit, OnChanges {
  @Input() destinations: Array<{ city?: string; count?: number }> = [];

  private chart?: Chart;
  private viewReady = false;

  ngAfterViewInit() {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges() {
    if (this.viewReady) this.renderChart();
  }

  private renderChart(): void {
    const canvas = document.getElementById('destinationChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    const rows = this.destinations?.length
      ? this.destinations
      : [{ city: 'No shipments yet', count: 0 }];

    this.chart?.destroy();

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(row => row.city || 'Unknown'),
        datasets: [{
          label: 'Shipments',
          data: rows.map(row => row.count || 0),
          backgroundColor: '#0b4a6f',
          borderRadius: 6,
          maxBarThickness: 28
        }]
      },
      options: {
        indexAxis: 'y',
        responsive:true,
        maintainAspectRatio:false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

}
