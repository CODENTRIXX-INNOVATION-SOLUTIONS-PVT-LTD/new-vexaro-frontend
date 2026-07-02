import { Component, inject, OnInit } from '@angular/core';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';
import { Chart } from 'chart.js';
import { ReportsService } from '../../../../services/reports.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-super-admin-shipment-reports',
  imports: [StatsCards],
  templateUrl: './super-admin-shipment-reports.html',
  styleUrl: './super-admin-shipment-reports.css',
})
export class SuperAdminShipmentReports implements OnInit {
  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);
  
  isLoading = false;

  shipmentCards = [
    {
      title: 'Total Shipments',
      value: 0,
      icon: 'fas fa-box',
      bgColor: '#DBEAFE',
      iconColor: 'rgb(11, 74, 111)',
    },
    {
      title: 'Delivered',
      value: 0,
      icon: 'fas fa-check-circle',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Pending',
      value: 0,
      icon: 'fas fa-clock',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: 'Failed',
      value: 0,
      icon: 'fas fa-times-circle',
      bgColor: '#FEE2E2',
      iconColor: '#DC2626'
    },
    {
      title: 'Returned',
      value: 0,
      icon: 'fas fa-undo',
      bgColor: '#F3E8FF',
      iconColor: '#9333EA'
    }
  ];

  topMerchantsByShipments: any[] = [];
  recentShipments: any[] = [];

  shipmentAnalytics = {
    deliverySuccessRate: 0,
    averageDeliveryTime: 0,
    delayedShipments: 0
  };

  ngOnInit() {
    this.loadShipmentData();
  }

  loadShipmentData() {
    this.isLoading = true;
    
    // Load shipment summary
    this.reportsService.getShipmentSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.shipmentCards[0].value = res.data.totalShipments || 0;
          this.shipmentCards[1].value = res.data.delivered || 0;
          this.shipmentCards[2].value = res.data.pending || 0;
          this.shipmentCards[3].value = res.data.failed || 0;
          this.shipmentCards[4].value = res.data.returned || 0;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading shipment summary:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load shipment trend data
    this.reportsService.getShipmentTrend({ period: 'week' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderTrendChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading shipment trend:', err);
      }
    });

    // Load shipment status data
    this.reportsService.getShipmentStatus().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderStatusChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading shipment status:', err);
      }
    });

    // Load shipment analytics
    this.reportsService.getShipmentAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.shipmentAnalytics.deliverySuccessRate = res.data.deliverySuccessRate || 0;
          this.shipmentAnalytics.averageDeliveryTime = res.data.averageDeliveryTime || 0;
          this.shipmentAnalytics.delayedShipments = res.data.delayedShipments || 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading shipment analytics:', err);
      }
    });

    // Load top merchants by shipments
    this.reportsService.getTopMerchantsByShipments({ limit: 5 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.topMerchantsByShipments = (res.data.merchants || []).map((m: any) => ({
            merchantName: m.merchantName || m.companyName || 'Unknown',
            totalShipments: m.totalShipments || 0,
            delivered: m.delivered || 0
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading top merchants by shipments:', err);
      }
    });

    // Load recent shipments
    this.reportsService.getRecentShipments({ limit: 5 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentShipments = (res.data.shipments || []).map((s: any) => ({
            trackingId: s.awb || s._id?.substring(0, 8) || '—',
            merchant: s.merchantId?.companyName || s.merchantId?.firstName || 'Unknown',
            status: this.getStatusLabel(s.status),
            date: s.createdAt 
              ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recent shipments:', err);
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'ORDER_CREATED': 'Pending',
      'PICKED_UP': 'Picked Up',
      'ARRIVED_AT_HUB': 'At Hub',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'DELIVERY_FAILED': 'Failed',
      'RTO': 'RTO',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'Delivered': 'delivered',
      'Pending': 'pending',
      'Picked Up': 'transit',
      'At Hub': 'transit',
      'Out for Delivery': 'transit',
      'Failed': 'pending',
      'RTO': 'pending',
      'Cancelled': 'pending'
    };
    return classMap[status] || 'pending';
  }

  renderTrendChart(data: any) {
    const ctx = document.getElementById('shipmentTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Parse backend data: { trend: [{ _id: '2024-01-01', count: 10 }] }
    const trendData = data.trend || [];
    const labels = trendData.map((item: any) => item._id);
    const values = trendData.map((item: any) => item.count);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Shipments',
            data: values,
            borderColor: 'rgb(11, 74, 111)',
            backgroundColor: 'rgb(11, 74, 111)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderStatusChart(data: any) {
    const ctx = document.getElementById('shipmentStatusChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Parse backend data: { statusBreakdown: [{ _id: 'DELIVERED', count: 10 }] }
    const statusData = data.statusBreakdown || [];
    const labels = statusData.map((item: any) => this.getStatusLabel(item._id));
    const values = statusData.map((item: any) => item.count);

    // Color mapping for statuses
    const colorMap: Record<string, string> = {
      'Delivered': '#22c55e',
      'Pending': 'rgb(232, 116, 58)',
      'Picked Up': 'rgb(59, 130, 246)',
      'At Hub': 'rgb(59, 130, 246)',
      'Out for Delivery': 'rgb(59, 130, 246)',
      'Failed': 'rgb(239, 68, 68)',
      'RTO': '#f59e0b',
      'Cancelled': '#6b7280'
    };
    const colors = statusData.map((item: any) => colorMap[this.getStatusLabel(item._id)] || '#9333ea');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
