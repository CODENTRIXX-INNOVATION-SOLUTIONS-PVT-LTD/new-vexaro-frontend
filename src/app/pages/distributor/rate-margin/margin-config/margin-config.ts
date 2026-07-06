import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RateService } from '../../../../services/rate.service';

interface MarginRow {
  rateCardId: string;
  rateCardName: string;
  serviceType: string;
  marginPercent: number;
  flatMargin: number;
  configId: string | null;
  editing: boolean;
  editMarginPercent: number;
  editFlatMargin: number;
}

@Component({
  selector: 'app-margin-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './margin-config.html',
  styleUrl: './margin-config.css',
})
export class MarginConfig implements OnInit {
  private rateService = inject(RateService);

  rows: MarginRow[] = [];
  isLoading = false;
  isSaving  = false;
  error     = '';
  successMsg = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const cards$   = this.rateService.getRateCards().pipe(catchError(() => of(null)));
    const margins$ = this.rateService.getMargins().pipe(catchError(() => of(null)));

    forkJoin([cards$, margins$]).subscribe({
      next: ([cardsRes, marginsRes]) => {
        const cards: any[]   = cardsRes?.data  ?? cardsRes  ?? [];
        const margins: any[] = marginsRes?.data?.margins ?? marginsRes?.data ?? marginsRes?.items ?? [];

        const marginMap = new Map<string, any>();
        margins.forEach((m: any) => {
          const rid = String(m.rateCardId?._id ?? m.rateCardId);
          marginMap.set(rid, m);
        });

        this.rows = cards
          .filter((c: any) => c.isActive !== false)
          .map((c: any): MarginRow => {
            const m = marginMap.get(String(c._id));
            return {
              rateCardId:        c._id,
              rateCardName:      c.name || c.serviceType,
              serviceType:       c.serviceType,
              marginPercent:     m?.marginPercent ?? 0,
              flatMargin:        m?.flatMargin    ?? 0,
              configId:          m?._id ?? null,
              editing:           false,
              editMarginPercent: m?.marginPercent ?? 0,
              editFlatMargin:    m?.flatMargin    ?? 0,
            };
          });

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load margin config.';
        this.isLoading = false;
      },
    });
  }

  startEdit(row: MarginRow): void {
    this.rows.forEach(r => r.editing = false);
    row.editMarginPercent = row.marginPercent;
    row.editFlatMargin    = row.flatMargin;
    row.editing           = true;
    this.error            = '';
  }

  cancelEdit(row: MarginRow): void {
    row.editing = false;
  }

  saveMargin(row: MarginRow): void {
    if (row.editMarginPercent < 0) { this.error = 'Margin % cannot be negative.'; return; }
    this.isSaving = true;
    this.error    = '';

    this.rateService.saveMarginConfig(row.rateCardId, {
      rateCardId:    row.rateCardId,
      marginPercent: row.editMarginPercent,
      flatMargin:    row.editFlatMargin,
    }).subscribe({
      next: () => {
        row.marginPercent = row.editMarginPercent;
        row.flatMargin    = row.editFlatMargin;
        row.editing       = false;
        this.isSaving     = false;
        this.successMsg   = `Margin saved for ${row.rateCardName}.`;
        setTimeout(() => { this.successMsg = ''; }, 3000);
      },
      error: (err) => {
        this.error    = err?.error?.message || 'Failed to save margin.';
        this.isSaving = false;
      },
    });
  }
}
