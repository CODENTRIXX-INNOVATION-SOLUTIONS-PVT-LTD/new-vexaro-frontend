import { Component, OnInit, signal, inject } from '@angular/core';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { StatsCards } from '../../../components/stats-cards/stats-cards';
import { RecentShipments } from '../../../components/recent-shipments/recent-shipments';
import { ChartSection } from '../../../charts/chart-section/chart-section';
import { RevenueChart } from '../../../charts/revenue-chart/revenue-chart';
import { RecentPayments } from '../../../components/recent-payments/recent-payments';
import { RecentRegistrations } from '../../../components/recent-registrations/recent-registrations';
import { DashboardService } from '../../../services/dashboard.service';

// Card shape expected by <app-stats-cards>
interface StatCard {
  title:      string;
  value:      string;
  symbol:     string;
  percentage: string;
  compairTo:  string;
  icon:       string;
  iconColor:  string;
  bgColor:    string;
}

// Static visual config — only `value` changes when real data arrives
const CARD_CONFIG: StatCard[] = [
  {
    title:      'Total Shipments Managed',
    value:      '0',
    symbol:     '+',
    percentage: '',
    compairTo:  '',
    icon:       'fas fa-box',
    iconColor:  'rgb(11, 74, 111)',
    bgColor:    '#dbeafe',
  },
  {
    title:      'Active Platform Distributors',
    value:      '0',
    symbol:     '+',
    percentage: '',
    compairTo:  '',
    icon:       'fas fa-users',
    iconColor:  '#14b8a6',
    bgColor:    '#ccfbf1',
  },
  {
    title:      'Vexaro Core Cash Pool',
    value:      '—',
    symbol:     '',
    percentage: '',
    compairTo:  '',
    icon:       'fas fa-indian-rupee-sign',
    iconColor:  '#7c3aed',
    bgColor:    '#ede9fe',
  },
  {
    title:      'System Disputes',
    value:      '0',
    symbol:     '',
    percentage: '',
    compairTo:  'total on record',
    icon:       'fas fa-scale-unbalanced',
    iconColor:  '#dc2626',
    bgColor:    '#fee2e2',
  },
];

@Component({
  selector: 'app-dashboard',
  imports: [
    DashboardHeader, StatsCards, RecentShipments,
    RecentPayments, RecentRegistrations, ChartSection, RevenueChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class SuperAdminDashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

  isLoading = signal(true);
  hasError  = signal(false);

  // Start with em-dash placeholders — replaced on successful API response
  cards: StatCard[] = CARD_CONFIG.map(c => ({ ...c }));

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        // Card 0 — Total Shipments
        this.cards[0].value = stats.totalShipments.toLocaleString('en-IN');

        // Card 1 — Active Distributors
        this.cards[1].value = stats.activeDistributors.toLocaleString('en-IN');

        // Card 2 — Cash Pool: no backend endpoint yet, keep placeholder
        this.cards[2].value = '—';

        // Card 3 — Disputes
        this.cards[3].value = stats.pendingDisputes.toLocaleString('en-IN');

        this.isLoading.set(false);
      },
      error: () => {
        // On failure keep '0' so no broken UI — card 2 (Cash Pool) stays '—' always
        this.isLoading.set(false);
        this.hasError.set(true);
      },
    });
  }
}
