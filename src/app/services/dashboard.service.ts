import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

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
    borderRadius?: number;
  }[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // Use /api/ instead of /api/v1/ (backend rewrites /api/ to /api/v1/)
  private readonly baseUrl = (window as any).__env?.apiUrl ?? '/api';
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

    // Each inner observable catches its own error and falls back to null.
    // This ensures forkJoin always completes even if one endpoint is down.
    return forkJoin([
      shipments$.pipe(catchError(() => of(null))),
      distributors$.pipe(catchError(() => of(null))),
      disputes$.pipe(catchError(() => of(null))),
    ]).pipe(
      map(([shipmentsRes, distributorsRes, disputesRes]) => ({
        totalShipments:     shipmentsRes?.data?.total    ?? 0,
        activeDistributors: distributorsRes?.meta?.total ?? 0,
        pendingDisputes:    disputesRes?.meta?.total     ?? 0,
      }))
    );
  }

  /**
   * Get shipment chart data from reports API
   * GET /reports/shipments → returns dailyVolume, byStatus, byService, and dailyStatusTrends
   */
  getShipmentChartData(): Observable<{ lineChart: ChartData; pieChart: PieChartData }> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments`).pipe(
      map((response) => {
        const data = response?.data || {};

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

        // Process dailyStatusTrends for line chart (status trends over time)
        const dailyStatusTrends = Array.isArray(data.dailyStatusTrends) ? data.dailyStatusTrends : [];
        
        // Get unique dates and statuses
        const uniqueDates = [...new Set(dailyStatusTrends.map((item: any) => item._id.date))].sort();
        const uniqueStatuses = [...new Set(dailyStatusTrends.map((item: any) => item._id.status))];

        // If no trend data, fall back to byStatus breakdown
        if (uniqueDates.length === 0) {
          const byStatusEntries = Object.entries(data.byStatus || {});
          const byStatus = byStatusEntries.length > 0 
            ? byStatusEntries.map(([status, count]) => ({ _id: status, count: count as number }))
            : [];
          
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
          
          const byService = Array.isArray(data.byService) ? data.byService : [];
          const pieChart: PieChartData = {
            labels: byService.map((item: any) => item._id || 'Unknown'),
            data: byService.map((item: any) => item.count)
          };

          return { lineChart, pieChart };
        }

        // Build datasets for each status
        const datasets = uniqueStatuses.map((status: unknown) => {
          const statusStr = status as string;
          const statusData = uniqueDates.map((date: unknown) => {
            const dateStr = date as string;
            const trend = dailyStatusTrends.find((item: any) => item._id.date === dateStr && item._id.status === statusStr);
            return trend ? trend.count : 0;
          });

          return {
            label: statusLabels[statusStr] || statusStr,
            data: statusData,
            borderColor: statusColors[statusStr] || '#2196f3',
            backgroundColor: statusColors[statusStr] || '#2196f3',
            tension: 0.4
          };
        });

        // Format dates for display
        const formattedLabels = uniqueDates.map((date: unknown) => {
          const dateStr = date as string;
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const lineChart: ChartData = {
          labels: formattedLabels,
          datasets
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

  /**
   * Get revenue chart data from reports API
   * GET /reports/revenue → returns revenue data over time
   */
  getRevenueChartData(): Observable<ChartData> {
    return this.http.get<any>(`${this.baseUrl}/reports/revenue`).pipe(
      map((response) => {
        const data = response?.data || {};
        const revenueData = Array.isArray(data.dailyRevenue) ? data.dailyRevenue : [];

        const labels = revenueData.map((item: any) => {
          const d = new Date(item._id?.date || item.date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const chartData: ChartData = {
          labels,
          datasets: [{
            label: 'Revenue (₹)',
            data: revenueData.map((item: any) => item.totalRevenue || item.revenue || 0),
            backgroundColor: 'rgb(11, 74, 111)',
            borderRadius: 8
          }]
        };

        return chartData;
      })
    );
  }
}
