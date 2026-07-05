import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-profit-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profit-report.html',
})
export class ProfitReport implements OnInit {
  private http = inject(HttpClient);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  isLoading = false;
  error     = '';

  walletBalance   = 0;
  totalShipments  = 0;
  deliveredCount  = 0;
  rtoCount        = 0;
  marginRows: any[] = [];

  get deliveryRate(): string {
    if (!this.totalShipments) return '—';
    return ((this.deliveredCount / this.totalShipments) * 100).toFixed(1) + '%';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const wallet$  = this.http.get<any>(`${this.base}/finance/wallet`).pipe(catchError(() => of(null)));
    const stats$   = this.http.get<any>(`${this.base}/shipments/stats`).pipe(catchError(() => of(null)));
    const margins$ = this.http.get<any>(`${this.base}/rates/margins`).pipe(catchError(() => of(null)));
    const cards$   = this.http.get<any>(`${this.base}/rates/cards`).pipe(catchError(() => of(null)));

    forkJoin([wallet$, stats$, margins$, cards$]).subscribe({
      next: ([walletRes, statsRes, marginsRes, cardsRes]) => {
        this.walletBalance  = walletRes?.data?.balance ?? 0;
        const s             = statsRes?.data ?? statsRes;
        this.totalShipments = s?.total    ?? 0;
        this.deliveredCount = s?.byStatus?.DELIVERED ?? 0;
        this.rtoCount       = s?.byStatus?.RTO       ?? 0;

        const cards: any[]   = cardsRes?.data  ?? cardsRes  ?? [];
        const margins: any[] = marginsRes?.data?.margins ?? marginsRes?.data ?? [];

        const marginMap = new Map<string, any>();
        margins.forEach((m: any) => marginMap.set(String(m.rateCardId?._id ?? m.rateCardId), m));

        this.marginRows = cards
          .filter((c: any) => c.isActive !== false)
          .map((c: any) => {
            const m = marginMap.get(String(c._id));
            return {
              name:          c.name || c.serviceType,
              serviceType:   c.serviceType,
              marginPercent: m?.marginPercent ?? 0,
              flatMargin:    m?.flatMargin    ?? 0,
              slabCount:     (c.weightSlabs ?? []).length,
            };
          });

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load profit data.';
        this.isLoading = false;
      },
    });
  }
}
