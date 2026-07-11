import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCards } from '../../../../components/stats-cards/stats-cards';
import { ReportsService } from '../../../../services/reports.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-super-admin-distributor-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCards
  ],
  templateUrl: './super-admin-distributor-reports.html',
  styleUrl: '../super-admin-revenue-reports/super-admin-revenue-reports.css',
})
export class SuperAdminDistributorReports implements OnInit, AfterViewInit {
  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);
  
  isLoading = false;

  distributorCards = [
    {
      title: 'Assigned Deliveries',
      value: 0,
      icon: 'fas fa-truck',
      bgColor: '#DBEAFE',
      iconColor: 'rgb(11, 74, 111)'
    },
    {
      title: 'Delivered',
      value: 0,
      icon: 'fas fa-check-circle',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'Failed Deliveries',
      value: 0,
      icon: 'fas fa-times-circle',
      bgColor: '#FEE2E2',
      iconColor: '#DC2626'
    },
    {
      title: 'COD Collected',
      value: '₹0',
      icon: 'fas fa-wallet',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    }
  ];

  distributorInsights = [
    {
      title: 'Success Rate',
      value: '0%',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'Average Delivery Time',
      value: '0 Days',
      icon: 'fas fa-clock'
    },
    {
      title: 'Active Distributors',
      value: '0',
      icon: 'fas fa-users'
    }
  ];

  topDistributors: any[] = [];
  recentActivities: any[] = [];

  ngOnInit() {
    this.loadDistributorData();
  }

  loadDistributorData() {
    this.isLoading = true;
    
    // Load distributor summary
    this.reportsService.getDistributorSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.distributorCards[0].value = res.data.assignedDeliveries || 0;
          this.distributorCards[1].value = res.data.delivered || 0;
          this.distributorCards[2].value = res.data.failedDeliveries || 0;
          this.distributorCards[3].value = '₹' + ((res.data.codCollected || 0) / 100000).toFixed(1) + 'L';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading distributor summary:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load distributor insights
    this.reportsService.getDistributorInsights().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.distributorInsights[0].value = (res.data.successRate || 0) + '%';
          this.distributorInsights[1].value = (res.data.averageDeliveryTime || 0) + ' Days';
          this.distributorInsights[2].value = res.data.activeDistributors || 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading distributor insights:', err);
      }
    });

    // Load top distributors
    this.reportsService.getTopDistributors({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.topDistributors = (res.data.distributors || []).map((d: any) => ({
            distributorName: d.distributorName || d.companyName || 'Unknown',
            deliveries: d.deliveries || 0,
            successRate: (d.successRate || 0) + '%'
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading top distributors:', err);
      }
    });

    // Load recent activities
    this.reportsService.getDistributorActivities({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentActivities = (res.data.activities || []).map((a: any) => ({
            distributor: a.distributorName || a.companyName || 'Unknown',
            activity: a.activity || '—',
            date: a.createdAt 
              ? new Date(a.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Today'
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recent activities:', err);
      }
    });

    // Load distributor performance
    this.reportsService.getDistributorPerformance().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderPerformanceChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading distributor performance:', err);
      }
    });

    // Load regional distribution
    this.reportsService.getRegionalDistribution().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderRegionalChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading regional distribution:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be rendered after data loads
  }

  renderPerformanceChart(data: any) {
    const ctx = document.getElementById('distributorPerformanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Parse backend data: { performance: [{ distributorName: 'Name', totalShipments: 100, deliveredShipments: 80, deliveryRate: 80 }] }
    const performanceData = data.performance || [];
    const labels = performanceData.map((item: any) => item.distributorName);
    const values = performanceData.map((item: any) => item.totalShipments);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Deliveries',
            data: values,
            backgroundColor: 'rgb(11, 74, 111)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderRegionalChart(data: any) {
    const ctx = document.getElementById('regionalChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Parse backend data: { regionalDistribution: [{ _id: 'CityName', count: 100 }] }
    const regionalData = data.regionalDistribution || [];
    const labels = regionalData.map((item: any) => item._id);
    const values = regionalData.map((item: any) => item.count);

    // Color mapping for regions
    const colors = regionalData.map((_: any, index: number) => {
      const colorPalette = ['rgb(11, 74, 111)', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#f59e0b', '#06b6d4', '#8b5cf6'];
      return colorPalette[index % colorPalette.length];
    });

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}