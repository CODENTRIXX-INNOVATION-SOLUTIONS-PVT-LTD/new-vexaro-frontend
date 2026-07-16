import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RateService } from "../../../services/rate.service";

interface WeightSlab {
  upToKg: number;
  ratePerKg: number;
  baseRate: number;
}

interface RateCard {
  _id: string;
  name: string;
  description: string;
  serviceType: string;
  weightSlabs: WeightSlab[];
  codCharge: number;
  codPercent: number;
  fuelSurcharge: number;
  superAdminMarkupPercent: number;
  isActive: boolean;
  applicableTo: string[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: "app-rate-management",
  imports: [CommonModule, FormsModule],
  templateUrl: "./rate-management.html",
  styleUrl: "./rate-management.css",
})
export class RateManagement implements OnInit {
  activeTab = signal<"rates" | "slabs">("rates");
  private rateService = inject(RateService);
  
  rateCards = signal<RateCard[]>([]);
  isLoading = signal<boolean>(false);
  
  // Edit rates variables
  editingRateId = signal<string | null>(null);
  editRateCard = signal<Partial<RateCard>>({});
  
  // Edit slabs variables
  editingSlabIndex = signal<number | null>(null);
  editingRateCardId = signal<string | null>(null);
  editSlab = signal<WeightSlab>({ upToKg: 1, ratePerKg: 0, baseRate: 0 });
  
  // Add slab form state
  isAddingSlab = signal<boolean>(false);

  // Info notification
  notificationMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadRateCards();
  }

  showNotification(msg: string) {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  loadRateCards() {
    this.isLoading.set(true);
    this.rateService.getRateCards().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rateCards.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading rate cards:', err);
        this.showNotification('Failed to load rate cards');
        this.isLoading.set(false);
      }
    });
  }

  // Rate actions
  startEditRate(card: RateCard) {
    this.editingRateId.set(card._id);
    this.editRateCard.set({ ...card });
  }

  saveRate() {
    const cardId = this.editingRateId();
    if (!cardId) return;
    
    const updates = {
      name: this.editRateCard().name,
      description: this.editRateCard().description,
      serviceType: this.editRateCard().serviceType,
      weightSlabs: this.editRateCard().weightSlabs,
      codCharge: this.editRateCard().codCharge,
      codPercent: this.editRateCard().codPercent,
      fuelSurcharge: this.editRateCard().fuelSurcharge,
      superAdminMarkupPercent: this.editRateCard().superAdminMarkupPercent,
    };
    
    console.log('Updating rate card:', cardId, 'with updates:', updates);
    
    this.rateService.updateRateCard(cardId, updates).subscribe({
      next: (res) => {
        console.log('Update rate card response:', res);
        if (res.success) {
          this.loadRateCards();
          this.editingRateId.set(null);
          this.showNotification('Rate card updated successfully.');
        } else {
          this.showNotification('Failed to update rate card: ' + (res.message || 'Unknown error'));
        }
      },
      error: (err) => {
        console.error('Error updating rate card:', err);
        if (err.status === 404) {
          this.showNotification('Rate card not found or unauthorized');
        } else if (err.status === 403) {
          this.showNotification('You do not have permission to modify rate cards');
        } else {
          this.showNotification('Failed to update rate card: ' + (err.message || err.status));
        }
      }
    });
  }

  cancelEditRate() {
    this.editingRateId.set(null);
    this.editRateCard.set({});
  }

  toggleCourierActive(card: RateCard) {
    const newStatus = !card.isActive;
    this.rateService.updateRateCard(card._id, { isActive: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadRateCards();
          const status = newStatus ? 'activated' : 'deactivated';
          this.showNotification(`Rate card ${card.name} has been ${status}.`);
        }
      },
      error: (err) => {
        console.error('Error toggling rate card:', err);
        this.showNotification('Failed to update rate card status');
      }
    });
  }

  // Slab actions
  startEditSlab(cardId: string, slabIndex: number) {
    this.editingRateCardId.set(cardId);
    this.editingSlabIndex.set(slabIndex);
    const card = this.rateCards().find(c => c._id === cardId);
    if (card && card.weightSlabs[slabIndex]) {
      this.editSlab.set({ ...card.weightSlabs[slabIndex] });
    }
  }

  saveSlab() {
    const cardId = this.editingRateCardId();
    const slabIndex = this.editingSlabIndex();
    if (!cardId || slabIndex === null) return;
    
    const card = this.rateCards().find(c => c._id === cardId);
    if (!card) return;
    
    const updatedSlabs = [...card.weightSlabs];
    updatedSlabs[slabIndex] = this.editSlab();
    
    this.rateService.updateRateCard(cardId, { weightSlabs: updatedSlabs }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadRateCards();
          this.editingRateCardId.set(null);
          this.editingSlabIndex.set(null);
          this.showNotification('Weight slab updated successfully.');
        }
      },
      error: (err) => {
        console.error('Error updating slab:', err);
        this.showNotification('Failed to update weight slab');
      }
    });
  }

  cancelEditSlab() {
    this.editingRateCardId.set(null);
    this.editingSlabIndex.set(null);
    this.editSlab.set({ upToKg: 1, ratePerKg: 0, baseRate: 0 });
  }

  // Show add slab form
  showAddSlabForm(cardId: string) {
    const card = this.rateCards().find(c => c._id === cardId);
    if (!card) return;
    
    // Set default values based on last slab
    const lastSlab = card.weightSlabs[card.weightSlabs.length - 1];
    const newUpToKg = lastSlab ? lastSlab.upToKg + 1 : 1;
    
    this.editingRateCardId.set(cardId);
    this.editingSlabIndex.set(-1); // -1 indicates adding new slab
    this.editSlab.set({ upToKg: newUpToKg, ratePerKg: 0, baseRate: 0 });
  }

  // Save new slab
  saveNewSlab(cardId: string) {
    const card = this.rateCards().find(c => c._id === cardId);
    if (!card) return;
    
    const newSlab = this.editSlab();
    const updatedSlabs = [...card.weightSlabs, newSlab];
    
    console.log('Saving new slab to card:', cardId, 'with slabs:', updatedSlabs);
    
    this.rateService.updateRateCard(cardId, { weightSlabs: updatedSlabs }).subscribe({
      next: (res) => {
        console.log('Save new slab response:', res);
        if (res.success) {
          this.loadRateCards();
          this.cancelAddSlab();
          this.showNotification('New slab added successfully.');
        } else {
          this.showNotification('Failed to add slab: ' + (res.message || 'Unknown error'));
        }
      },
      error: (err) => {
        console.error('Error adding slab:', err);
        if (err.status === 404) {
          this.showNotification('Rate card not found or unauthorized');
        } else if (err.status === 403) {
          this.showNotification('You do not have permission to modify rate cards');
        } else {
          this.showNotification('Failed to add slab: ' + (err.message || err.status));
        }
      }
    });
  }

  // Cancel add slab form
  cancelAddSlab() {
    this.editingRateCardId.set(null);
    this.editingSlabIndex.set(null);
    this.editSlab.set({ upToKg: 1, ratePerKg: 0, baseRate: 0 });
  }

  // Remove slab from rate card
  removeSlab(cardId: string, slabIndex: number) {
    const card = this.rateCards().find(c => c._id === cardId);
    if (!card || card.weightSlabs.length <= 1) return;
    
    const updatedSlabs = card.weightSlabs.filter((_, i) => i !== slabIndex);
    
    this.rateService.updateRateCard(cardId, { weightSlabs: updatedSlabs }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadRateCards();
          this.showNotification('Slab removed successfully.');
        }
      },
      error: (err) => {
        console.error('Error removing slab:', err);
        this.showNotification('Failed to remove slab');
      }
    });
  }
}
