import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

import { StatsCards } from '../../../../components/stats-cards/stats-cards';
import { ReportsService } from '../../../../services/reports.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-super-admin-merchant-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsCards
  ],
  templateUrl: './super-admin-merchant-reports.html',
  styleUrl: '../super-admin-revenue-reports/super-admin-revenue-reports.css',
})
export class SuperAdminMerchantReports implements OnInit, AfterViewInit {
  private reportsService = inject(ReportsService);
  private cdr = inject(ChangeDetectorRef);
  
  isLoading = false;

  merchantCards = [
    {
      title: 'Total Merchants',
      value: 0,
      icon: 'fas fa-store',
      bgColor: '#DBEAFE',
      iconColor: 'rgb(11, 74, 111)'
    },
    {
      title: 'Active Merchants',
      value: 0,
      icon: 'fas fa-user-check',
      bgColor: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: 'New This Month',
      value: 0,
      icon: 'fas fa-user-plus',
      bgColor: '#FEF3C7',
      iconColor: '#D97706'
    }
  ];

  merchantInsights = [
    {
      title: 'Merchant Retention',
      value: '0%',
      icon: 'fas fa-users'
    },
    {
      title: 'Top Category',
      value: '—',
      icon: 'fas fa-tags'
    },
    {
      title: 'Inactive Merchants',
      value: '0',
      icon: 'fas fa-user-clock'
    }
  ];

  topMerchants: any[] = [];
  merchantCategories: any[] = [];
  recentMerchants: any[] = [];

  ngOnInit() {
    this.loadMerchantData();
  }

  loadMerchantData() {
    this.isLoading = true;
    
    // Load merchant summary
    this.reportsService.getMerchantSummary().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.merchantCards[0].value = res.data.totalMerchants || 0;
          this.merchantCards[1].value = res.data.activeMerchants || 0;
          this.merchantCards[2].value = res.data.newThisMonth || 0;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading merchant summary:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    // Load merchant insights
    this.reportsService.getMerchantInsights().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.merchantInsights[0].value = (res.data.retentionRate || 0) + '%';
          this.merchantInsights[1].value = res.data.topCategory || '—';
          this.merchantInsights[2].value = res.data.inactiveMerchants || 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading merchant insights:', err);
      }
    });

    // Load top merchants
    this.reportsService.getTopMerchants({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.topMerchants = (res.data.merchants || []).map((m: any) => ({
            merchantName: m.merchantName || 'Unknown',
            orders: m.orders || 0
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading top merchants:', err);
      }
    });

    // Load merchant categories
    this.reportsService.getMerchantsByCategory().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.merchantCategories = (res.data.categories || []).map((c: any) => ({
            category: c.category || 'Unknown',
            merchants: c.count || 0
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading merchant categories:', err);
      }
    });

    // Load recent merchants
    this.reportsService.getRecentMerchants({ limit: 3 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentMerchants = (res.data.merchants || []).map((m: any) => ({
            merchantName: m.companyName || m.firstName || 'Unknown',
            city: m.city || '—',
            joinedDate: m.createdAt 
              ? new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—',
            status: m.status || 'Active'
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading recent merchants:', err);
      }
    });

    // Load merchant growth
    this.reportsService.getMerchantGrowth({ period: 'month' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderGrowthChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading merchant growth:', err);
      }
    });

    // Load category distribution
    this.reportsService.getMerchantCategoryDistribution().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.renderCategoryChart(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading category distribution:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be rendered after data loads
  }

  renderGrowthChart(data: any) {
    const ctx = document.getElementById('merchantGrowthChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Merchants',
          data: data.values || [55, 65, 78, 88, 102, 120],
          borderColor: 'rgb(11, 74, 111)',
          backgroundColor: 'rgb(11, 74, 111)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderCategoryChart(data: any) {
    const ctx = document.getElementById('merchantCategoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels || ['Fashion', 'Electronics', 'Home Decor', 'Beauty'],
        datasets: [{
          data: data.values || [42, 28, 19, 12]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}