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
    this.slabs = [
      { id: '1', courier: 'Delhivery', weightFrom: 0, weightTo: 0.5, distributorCost: 40, currentMargin: 10, editMargin: 10, merchantRate: 50, editing: false },
      { id: '2', courier: 'Delhivery', weightFrom: 0.5, weightTo: 1.0, distributorCost: 72, currentMargin: 18, editMargin: 18, merchantRate: 90, editing: false },
      { id: '3', courier: 'DTDC', weightFrom: 0, weightTo: 0.5, distributorCost: 45, currentMargin: 10, editMargin: 10, merchantRate: 55, editing: false },
      { id: '4', courier: 'DTDC', weightFrom: 0.5, weightTo: 1.0, distributorCost: 78, currentMargin: 17, editMargin: 17, merchantRate: 95, editing: false },
      { id: '5', courier: 'BlueDart', weightFrom: 0, weightTo: 0.5, distributorCost: 55, currentMargin: 15, editMargin: 15, merchantRate: 70, editing: false },
      { id: '6', courier: 'BlueDart', weightFrom: 0.5, weightTo: 1.0, distributorCost: 93, currentMargin: 22, editMargin: 22, merchantRate: 115, editing: false },
    ];
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
