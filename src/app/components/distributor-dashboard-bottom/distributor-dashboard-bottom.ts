import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ActivityItem {
  merchantId: string;
  businessName: string;
  action: string;
  amount?: number;
  awb?: string;
  date: string;
  status: string;
}

interface Summary {
  totalMerchants: number;
  activeMerchants: number;
  totalRevenue: number;
  totalProfit: number;
  openDisputes: number;
}

@Component({
  selector: 'app-distributor-dashboard-bottom',
  imports: [CommonModule],
  templateUrl: './distributor-dashboard-bottom.html',
  styleUrl: './distributor-dashboard-bottom.css',
})
export class DistributorDashboardBottom implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = true;

  merchantActivity: ActivityItem[] = [];

  summary: Summary = {
    totalMerchants: 0,
    activeMerchants: 0,
    totalRevenue: 0,
    totalProfit: 0,
    openDisputes: 0,
  };

  ngOnInit(): void {
    const transactions$ = this.http.get<any>(`${this.baseUrl}/finance/transactions`, {
      params: new HttpParams().set('limit', '5'),
    }).pipe(catchError(() => of(null)));

    const merchants$ = this.http.get<any>(`${this.baseUrl}/users`, {
      params: new HttpParams().set('role', 'MERCHANT').set('limit', '100'),
    }).pipe(catchError(() => of(null)));

    const wallet$ = this.http.get<any>(`${this.baseUrl}/finance/wallet`).pipe(catchError(() => of(null)));

    const disputes$ = this.http.get<any>(`${this.baseUrl}/disputes`, {
      params: new HttpParams().set('limit', '1').set('status', 'OPEN'),
    }).pipe(catchError(() => of(null)));

    forkJoin([transactions$, merchants$, wallet$, disputes$]).subscribe({
      next: ([txRes, merchantsRes, walletRes, disputesRes]) => {
        // ── Franchise Summary ─────────────────────────────────────────────
        const allMerchants: any[] = merchantsRes?.data?.users ?? [];
        this.summary.totalMerchants = merchantsRes?.meta?.total ?? allMerchants.length;
        this.summary.activeMerchants = allMerchants.filter(m => m.isActive).length;
        this.summary.totalRevenue = walletRes?.data?.balance ?? 0;
        this.summary.openDisputes = disputesRes?.meta?.total ?? 0;
        this.summary.totalProfit = 0;

        // Build a map of merchant details keyed by user ID
        const merchantMap = new Map<string, any>();
        allMerchants.forEach((m: any) => {
          const mid = m.id ?? m._id;
          if (mid) {
            merchantMap.set(mid.toString(), m);
          }
        });

        // ── Recent Activity from latest transactions ───────────────────────
        const DEBIT_TYPES = new Set(['DEBIT', 'CHARGE', 'SETTLEMENT', 'TRANSFER_DEBIT', 'DISPUTE_CHARGE', 'RTO_CHARGE']);
        const txs: any[] = txRes?.data?.transactions ?? [];
        this.merchantActivity = txs.map(t => {
          const userIdStr = (t.userId?._id ?? t.userId?.id ?? t.userId)?.toString();
          const merchant = userIdStr ? merchantMap.get(userIdStr) : null;
          const businessName = merchant
            ? ((merchant.companyName ?? `${merchant.firstName ?? ''} ${merchant.lastName ?? ''}`.trim()) || 'Unknown')
            : t.note || 'Wallet Transaction';

          return {
            merchantId: userIdStr ?? '—',
            businessName: businessName,
            action: this.formatTxType(t.type),
            amount: t.amount ? Math.abs(t.amount) : undefined,
            awb: t.shipmentId?.awb ?? undefined,
            date: t.createdAt
              ? new Date(t.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              : '—',
            status: DEBIT_TYPES.has(t.type) ? 'Debit' : 'Credit',
          };
        });

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  viewAll(): void {
    this.router.navigate(['/distributor/finance/transactions']);
  }

  private formatTxType(type: string): string {
    const map: Record<string, string> = {
      TOPUP: 'Wallet Top-up',
      CHARGE: 'Shipment Charge',
      REFUND: 'Refund',
      COD_CREDIT: 'COD Released',
      TRANSFER_CREDIT: 'Funds Received',
      TRANSFER_DEBIT: 'Funds Transferred',
      DISPUTE_CHARGE: 'Dispute Deduction',
      RTO_CHARGE: 'RTO Charge',
      SETTLEMENT: 'Settlement',
    };
    return map[type] ?? type;
  }
}
