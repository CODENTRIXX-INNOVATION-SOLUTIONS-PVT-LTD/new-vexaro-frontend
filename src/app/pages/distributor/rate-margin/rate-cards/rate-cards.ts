import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RateService } from '../../../../services/rate.service';

interface WeightSlab {
  upToKg: number;
  ratePerKg: number;
  baseRate: number;
}

interface RateCardView {
  id: string;
  name: string;
  serviceType: string;
  weightSlabs: WeightSlab[];
  codCharge: number;
  codPercent: number;
  fuelSurcharge: number;
  superAdminMarkupPercent: number;
  isActive: boolean;
  // Distributor's own margin on this card (from MarginConfig)
  marginPercent: number;
  flatMargin: number;
  marginConfigId: string | null;
  expanded: boolean;
}

@Component({
  selector: 'app-rate-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rate-cards.html',
  styleUrl: './rate-cards.css',
})
export class RateCards implements OnInit {
  private rateService = inject(RateService);

  rateCards: RateCardView[] = [];
  isLoading = false;
  error     = '';

  // Inline margin editing
  editingId: string | null = null;
  editMarginPercent = 0;
  editFlatMargin    = 0;
  isSaving          = false;
  saveError         = '';
  saveSuccess       = '';

  // Filter
  serviceFilter = '';
  get serviceTypes(): string[] {
    return [...new Set(this.rateCards.map(r => r.serviceType))].sort();
  }
  get filtered(): RateCardView[] {
    return this.serviceFilter
      ? this.rateCards.filter(r => r.serviceType === this.serviceFilter)
      : this.rateCards;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error     = '';

    const cards$   = this.rateService.getRateCards().pipe(catchError(() => of(null)));
    const margins$ = this.rateService.getMargins().pipe(catchError(() => of(null)));

    forkJoin([cards$, margins$]).subscribe({
      next: ([cardsRes, marginsRes]) => {
        const cards: any[]   = cardsRes?.data  ?? cardsRes  ?? [];
        const margins: any[] = marginsRes?.data?.margins ?? marginsRes?.data ?? marginsRes?.items ?? [];

        // Build a lookup: rateCardId → marginConfig
        const marginMap = new Map<string, any>();
        margins.forEach((m: any) => {
          const rid = m.rateCardId?._id ?? m.rateCardId;
          if (rid) marginMap.set(String(rid), m);
        });

        this.rateCards = cards
          .filter((c: any) => c.isActive !== false)
          .map((c: any): RateCardView => {
            const margin = marginMap.get(String(c._id));
            return {
              id:                      c._id,
              name:                    c.name || c.serviceType,
              serviceType:             c.serviceType,
              weightSlabs:             c.weightSlabs ?? [],
              codCharge:               c.codCharge       ?? 0,
              codPercent:              c.codPercent       ?? 0,
              fuelSurcharge:           c.fuelSurcharge    ?? 0,
              superAdminMarkupPercent: c.superAdminMarkupPercent ?? 0,
              isActive:                c.isActive ?? true,
              marginPercent:           margin?.marginPercent ?? 0,
              flatMargin:              margin?.flatMargin    ?? 0,
              marginConfigId:          margin?._id ?? null,
              expanded:                false,
            };
          });

        this.isLoading = false;
      },
      error: (err) => {
        this.error     = err?.error?.message || 'Failed to load rate cards.';
        this.isLoading = false;
      },
    });
  }

  // ── Margin editing ────────────────────────────────────────────────────────
  startEdit(card: RateCardView): void {
    this.editingId        = card.id;
    this.editMarginPercent = card.marginPercent;
    this.editFlatMargin    = card.flatMargin;
    this.saveError        = '';
    this.saveSuccess      = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.saveError = '';
  }

  saveMargin(card: RateCardView): void {
    if (this.editMarginPercent < 0) {
      this.saveError = 'Margin % cannot be negative.';
      return;
    }
    this.isSaving  = true;
    this.saveError = '';

    this.rateService.saveMarginConfig(card.id, {
      rateCardId:    card.id,
      marginPercent: this.editMarginPercent,
      flatMargin:    this.editFlatMargin,
    }).subscribe({
      next: () => {
        card.marginPercent = this.editMarginPercent;
        card.flatMargin    = this.editFlatMargin;
        this.isSaving      = false;
        this.editingId     = null;
        this.saveSuccess   = `Margin saved for ${card.name}.`;
        setTimeout(() => { this.saveSuccess = ''; }, 3000);
      },
      error: (err) => {
        this.saveError = err?.error?.message || 'Failed to save margin.';
        this.isSaving  = false;
      },
    });
  }

  // Calculate what a merchant pays for a given slab + this card's margin
  merchantRate(slab: WeightSlab, card: RateCardView): number {
    const base = slab.baseRate + slab.ratePerKg * slab.upToKg;
    const withFuel = base * (1 + card.fuelSurcharge / 100);
    return Math.ceil(withFuel * (1 + card.marginPercent / 100) + card.flatMargin);
  }
}
