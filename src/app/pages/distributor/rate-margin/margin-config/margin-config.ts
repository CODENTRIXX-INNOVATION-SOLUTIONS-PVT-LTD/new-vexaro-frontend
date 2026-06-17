import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  slabs: MarginSlab[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  ngOnInit() {
    this.loadSlabs();
  }

  loadSlabs() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/margins
    this.isLoading = false;
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
    this.isSaving = true;
    // TODO: PUT /distributor/:id/margins/:slabId { margin: slab.editMargin }
    // Response updates: merchantRate = distributorCost + editMargin
    slab.currentMargin = slab.editMargin;
    slab.merchantRate = slab.distributorCost + slab.editMargin;
    slab.editing = false;
    this.isSaving = false;
  }

  getProfit(slab: MarginSlab): number {
    return slab.currentMargin;
  }
}
