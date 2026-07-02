import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RateService } from '../../../../services/rate.service';
import { AuthService } from '../../../../services/auth.service';

export interface MarginSlab {
  id: string;
  courier: string;
  weightFrom: number;
  weightTo: number;
  distributorCost: number;
  currentMargin: number;
  editMargin: number;
  merchantRate: number;
  editing: boolean;
}

@Component({
  selector: 'app-margin-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './margin-config.html',
  styleUrl: './margin-config.css'
})
export class MarginConfig implements OnInit {
  distributorId: string = '';
  slabs: MarginSlab[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(private rateService: RateService, private authService: AuthService) {}

  ngOnInit() {
    this.loadDistributorId();
    this.loadSlabs();
  }

  loadDistributorId() {
    this.authService.getMe().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.distributorId = response.data.id || response.data._id || '';
        }
      },
      error: (error) => {
        console.error('Error loading distributor ID:', error);
      }
    });
  }

  loadSlabs() {
    this.isLoading = true;
    this.rateService.getMargins().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.margins) {
          this.slabs = response.data.margins.map((m: any) => ({
            id: m.id,
            courier: m.courier || 'N/A',
            weightFrom: m.weightFrom || 0,
            weightTo: m.weightTo || 0,
            distributorCost: m.distributorCost || 0,
            currentMargin: m.marginPercent || 0,
            editMargin: m.marginPercent || 0,
            merchantRate: m.merchantRate || 0,
            editing: false
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading margins:', error);
        this.isLoading = false;
      }
    });
  }

  startEdit(slab: MarginSlab) {
    slab.editing = true;
    slab.editMargin = slab.currentMargin;
  }

  cancelEdit(slab: MarginSlab) {
    slab.editing = false;
    slab.editMargin = slab.currentMargin;
  }

  saveMargin(slab: MarginSlab) {
    if (slab.editMargin < 0) return;
    if (!this.distributorId) {
      alert('Distributor ID not found. Please refresh the page.');
      return;
    }
    this.isSaving = true;
    this.rateService.saveMarginConfig(this.distributorId, {
      rateCardId: slab.id,
      marginPercent: slab.editMargin,
      flatMargin: slab.editMargin
    }).subscribe({
      next: (response) => {
        slab.currentMargin = slab.editMargin;
        slab.merchantRate = slab.distributorCost + slab.editMargin;
        slab.editing = false;
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving margin:', error);
        this.isSaving = false;
        alert(error.error?.message || 'Failed to save margin. Please try again.');
      }
    });
  }

  getProfit(slab: MarginSlab): number {
    return slab.currentMargin;
  }
}
