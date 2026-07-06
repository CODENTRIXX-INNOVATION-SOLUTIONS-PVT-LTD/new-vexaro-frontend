import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RateService } from '../../../../services/rate.service';
import { FinanceService } from '../../../../services/finance.service';

interface MarginSummaryRow {
  rateCardName: string;
  serviceType: string;
  marginPercent: number;
  flatMargin: number;
  slabCount: number;
}

@Component({
  selector: 'app-profit-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profit-view.html',
  styleUrl: './profit-view.css',
})
export class ProfitView implements OnInit {
  private rateService    = inject(RateService);
  private financeService = inject(FinanceService);

  isLoading  = false;
  error      = '';

  walletBalance  = 0;
  marginRows: MarginSummaryRow[] = [];

  get configuredCount(): number {
    return this.marginRows.filter(r => r.marginPercent > 0).length;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const cards$   = this.rateService.getRateCards().pipe(catchError(() => of(null)));
    const margins$ = this.rateService.getMargins().pipe(catchError(() => of(null)));
    const wallet$  = this.financeService.getMyWallet().pipe(catchError(() => of(null)));

    forkJoin([cards$, margins$, wallet$]).subscribe({
      next: ([cardsRes, marginsRes, walletRes]) => {
        const cards: any[]   = cardsRes?.data  ?? cardsRes  ?? [];
        const margins: any[] = marginsRes?.data?.margins ?? marginsRes?.data ?? marginsRes?.items ?? [];

        this.walletBalance = walletRes?.data?.balance ?? 0;

        const marginMap = new Map<string, any>();
        margins.forEach((m: any) => {
          marginMap.set(String(m.rateCardId?._id ?? m.rateCardId), m);
        });

        this.marginRows = cards
          .filter((c: any) => c.isActive !== false)
          .map((c: any): MarginSummaryRow => {
            const m = marginMap.get(String(c._id));
            return {
              rateCardName:  c.name || c.serviceType,
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
