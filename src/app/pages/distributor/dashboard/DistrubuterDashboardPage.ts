import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/dashboard-header/dashboard-header';
import { DistributorDashboardBottom } from '../../../components/distributor-dashboard-bottom/distributor-dashboard-bottom';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface KpiCard {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardHeader, DistributorDashboardBottom, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DistrubuterDashboardPage implements OnInit {
  private http = inject(HttpClient);
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = true;

  user = { name: '', email: '', profileImage: '' };

  cards: KpiCard[] = [
    { title: 'Total Shipments',   value: '—', icon: 'fa-box',          iconColor: 'rgb(11, 74, 111)', bgColor: '#dbeafe' },
    { title: 'Active Merchants',  value: '—', icon: 'fa-user-check',   iconColor: '#16a34a',          bgColor: '#dcfce7' },
    { title: 'Wallet Balance',    value: '—', icon: 'fa-wallet',       iconColor: '#7c3aed',          bgColor: '#ede9fe' },
    { title: "Today's Bookings",  value: '—', icon: 'fa-box',          iconColor: 'rgb(232, 116, 58)', bgColor: '#fef3c7' },
    { title: 'Open Disputes',     value: '—', icon: 'fa-balance-scale', iconColor: '#dc2626',         bgColor: '#fee2e2' },
    { title: 'Total Shipments (All Time)', value: '—', icon: 'fa-chart-line', iconColor: '#10b981',  bgColor: '#d1fae5' },
  ];

  ngOnInit(): void {
    // Load user from localStorage immediately
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored) {
        this.user.name  = `${stored.firstName ?? ''} ${stored.lastName ?? ''}`.trim();
        this.user.email = stored.email ?? '';
      }
    } catch { /* keep blank */ }

    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading = true;

    const stats$      = this.http.get<any>(`${this.baseUrl}/shipments/stats`).pipe(catchError(() => of(null)));
    const merchants$  = this.http.get<any>(`${this.baseUrl}/users`, {
      params: new HttpParams().set('role', 'MERCHANT').set('limit', '1'),
    }).pipe(catchError(() => of(null)));
    const wallet$     = this.http.get<any>(`${this.baseUrl}/finance/wallet`).pipe(catchError(() => of(null)));
    const disputes$   = this.http.get<any>(`${this.baseUrl}/disputes`, {
      params: new HttpParams().set('limit', '1').set('status', 'OPEN'),
    }).pipe(catchError(() => of(null)));

    forkJoin([stats$, merchants$, wallet$, disputes$]).subscribe({
      next: ([statsRes, merchantsRes, walletRes, disputesRes]) => {
        const stats = statsRes?.data ?? statsRes;

        // Card 0 — Total Shipments (delivered)
        const delivered = stats?.byStatus?.DELIVERED ?? 0;
        this.cards[0].value = delivered.toLocaleString('en-IN');

        // Card 1 — Active Merchants
        const totalMerchants = merchantsRes?.meta?.total ?? 0;
        this.cards[1].value  = totalMerchants.toLocaleString('en-IN');

        // Card 2 — Wallet Balance
        const balance = walletRes?.data?.balance ?? null;
        this.cards[2].value = balance !== null ? `₹${balance.toLocaleString('en-IN')}` : '—';

        // Card 3 — Today's Bookings
        const today = stats?.today ?? 0;
        this.cards[3].value = today.toLocaleString('en-IN');

        // Card 4 — Open Disputes
        const openDisputes = disputesRes?.meta?.total ?? 0;
        this.cards[4].value = openDisputes.toLocaleString('en-IN');

        // Card 5 — All-time Total Shipments
        const total = stats?.total ?? 0;
        this.cards[5].value = total.toLocaleString('en-IN');

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }
}
