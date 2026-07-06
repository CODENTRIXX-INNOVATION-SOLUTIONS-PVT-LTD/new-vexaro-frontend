import { Component, AfterViewInit, Input, OnChanges } from '@angular/core';
import Chart from 'chart.js/auto';

type ShipmentTrendRow = {
  label?: string;
  date?: string;
  delivered?: number;
  inTransit?: number;
  pending?: number;
};

@Component({
  selector: 'app-shipment-overview',
  imports: [],
  templateUrl: './shipment-overview.html',
  styleUrl: './shipment-overview.css'
})
export class ShipmentOverview implements AfterViewInit, OnChanges {
  @Input() trend: ShipmentTrendRow[] = [];

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
    const canvas = document.getElementById('shipmentChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    const rows = this.trend?.length ? this.trend : this.emptyTrend();
    this.chart?.destroy();

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: rows.map(row => row.label || row.date || ''),
        datasets: [
          {
            label: 'Delivered',
            data: rows.map(row => row.delivered || 0),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.12)',
            tension: 0.35,
            fill: true
          },
          {
            label: 'In Transit',
            data: rows.map(row => row.inTransit || 0),
            borderColor: '#0b4a6f',
            backgroundColor: 'rgba(11, 74, 111, 0.1)',
            tension: 0.35,
            fill: true
          },
          {
            label: 'Pending',
            data: rows.map(row => row.pending || 0),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.35,
            fill: true
          }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins: {
          legend: {
            labels: { boxWidth: 10, usePointStyle: true }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  private emptyTrend(): ShipmentTrendRow[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        delivered: 0,
        inTransit: 0,
        pending: 0,
      };
    });
  }
}
