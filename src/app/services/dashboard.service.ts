import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

export interface DashboardStats {
  totalShipments: number;
  activeDistributors: number;
  pendingDisputes: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
  }[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // Use /api/ instead of /api/v1/ (backend rewrites /api/ to /api/v1/)
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api';
  private http = inject(HttpClient);

  /**
   * Three parallel requests combined into one stats object.
   *
   * GET /shipments/stats          → data.total  = total shipment count
   * GET /users?role=DISTRIBUTOR   → meta.total  = distributor count
   * GET /disputes                 → meta.total  = dispute count
   */
  getDashboardStats(): Observable<DashboardStats> {
    const shipments$ = this.http.get<any>(
      `${this.baseUrl}/shipments/stats`
    );

    const distributors$ = this.http.get<any>(
      `${this.baseUrl}/users`,
      { params: new HttpParams().set('role', 'DISTRIBUTOR').set('limit', '1') }
    );

    const disputes$ = this.http.get<any>(
      `${this.baseUrl}/disputes`,
      { params: new HttpParams().set('limit', '1') }
    );

    return forkJoin([shipments$, distributors$, disputes$]).pipe(
      map(([shipmentsRes, distributorsRes, disputesRes]) => ({
        totalShipments:     shipmentsRes?.data?.total    ?? 0,
        activeDistributors: distributorsRes?.meta?.total ?? 0,
        pendingDisputes:    disputesRes?.meta?.total     ?? 0,
      }))
    );
  }

  /**
   * Get shipment chart data from reports API
   * GET /reports/shipments → returns dailyVolume, byStatus, and byService
   */
  getShipmentChartData(): Observable<{ lineChart: ChartData; pieChart: PieChartData }> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments`).pipe(
      map((response) => {
        const data = response?.data || {};

        // Process byStatus for line chart (shipment status breakdown)
        const byStatus = Array.isArray(data.byStatus) ? data.byStatus : [];
        
        // Status color mapping
        const statusColors: { [key: string]: string } = {
          'ORDER_CREATED': '#ff9800',
          'PICKED_UP': '#2196f3',
          'ARRIVED_AT_HUB': '#9c27b0',
          'OUT_FOR_DELIVERY': '#00bcd4',
          'DELIVERED': '#4caf50',
          'DELIVERY_FAILED': '#f44336',
          'RTO': '#795548',
          'CANCELLED': '#9e9e9e'
        };

        const statusLabels: { [key: string]: string } = {
          'ORDER_CREATED': 'Pending',
          'PICKED_UP': 'Picked Up',
          'ARRIVED_AT_HUB': 'At Hub',
          'OUT_FOR_DELIVERY': 'Out for Delivery',
          'DELIVERED': 'Delivered',
          'DELIVERY_FAILED': 'Delivery Failed',
          'RTO': 'RTO',
          'CANCELLED': 'Cancelled'
        };

        const lineChart: ChartData = {
          labels: ['Status Breakdown'],
          datasets: byStatus.map((item: any) => ({
            label: statusLabels[item._id] || item._id,
            data: [item.count],
            borderColor: statusColors[item._id] || '#2196f3',
            backgroundColor: statusColors[item._id] || '#2196f3',
            tension: 0.4
          }))
        };

        // Process byService for pie chart (courier distribution)
        const byService = Array.isArray(data.byService) ? data.byService : [];
        const pieChart: PieChartData = {
          labels: byService.map((item: any) => item._id || 'Unknown'),
          data: byService.map((item: any) => item.count)
        };

        return { lineChart, pieChart };
      })
    );
  }
}
