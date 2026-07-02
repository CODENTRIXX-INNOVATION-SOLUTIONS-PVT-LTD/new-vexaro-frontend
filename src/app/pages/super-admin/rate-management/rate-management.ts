import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface RateCard {
  courier: string;
  code: string;
  baseRate: number;
  additionalRate: number;
  codPercent: number;
  codMin: number;
  fuelSurcharge: number;
  active: boolean;
}

interface WeightSlab {
  id: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  increment: number;
  description: string;
}

@Component({
  selector: "app-rate-management",
  imports: [CommonModule, FormsModule],
  templateUrl: "./rate-management.html",
  styleUrl: "./rate-management.css",
})
export class RateManagement {
  activeTab = signal<"rates" | "slabs" | "cod">("rates");
  
  rateCards = signal<RateCard[]>([
    { courier: "Delhivery Air", code: "delhivery_air", baseRate: 75, additionalRate: 65, codPercent: 2.0, codMin: 45, fuelSurcharge: 12.5, active: true },
    { courier: "Delhivery Surface", code: "delhivery_surface", baseRate: 48, additionalRate: 40, codPercent: 1.8, codMin: 40, fuelSurcharge: 10.0, active: true },
    { courier: "BlueDart Express", code: "bluedart_express", baseRate: 110, additionalRate: 95, codPercent: 2.5, codMin: 60, fuelSurcharge: 15.0, active: true },
    { courier: "ExpressBees B2C", code: "xpressbees_b2c", baseRate: 42, additionalRate: 36, codPercent: 1.5, codMin: 35, fuelSurcharge: 8.0, active: true },
    { courier: "Ecom Express", code: "ecom_express", baseRate: 45, additionalRate: 38, codPercent: 1.6, codMin: 35, fuelSurcharge: 9.0, active: false }
  ]);

  weightSlabs = signal<WeightSlab[]>([
    { id: "SLAB-0.5", name: "Standard Envelope/Box", minWeight: 0, maxWeight: 0.5, increment: 0.5, description: "Small document packets and light items up to 500 grams." },
    { id: "SLAB-1.0", name: "Medium Package", minWeight: 0.5, maxWeight: 1.0, increment: 0.5, description: "Parcels between 500g and 1kg weight limit." },
    { id: "SLAB-2.0", name: "Heavy Cargo Slab", minWeight: 1.0, maxWeight: 2.0, increment: 1.0, description: "Parcels up to 2kg weight limit." },
    { id: "SLAB-5.0", name: "Bulk Freight Slab", minWeight: 2.0, maxWeight: 5.0, increment: 5.0, description: "Heavy shipments calculated in 5kg incremental steps." }
  ]);

  // Global settings model
  globalFuelSurcharge = signal<number>(12);
  globalMinCod = signal<number>(40);

  // Edit rates variables
  editingRateIndex = signal<number | null>(null);
  editBaseRateValue = 0;
  editAddlRateValue = 0;
  editFuelSurchargeValue = 0;

  // Edit slabs variables
  editingSlabId = signal<string | null>(null);
  editSlabName = "";
  editSlabIncrement = 0.5;

  // Info notification
  notificationMessage = signal<string | null>(null);

  showNotification(msg: string) {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  // Rate actions
  startEditRate(idx: number) {
    const card = this.rateCards()[idx];
    this.editingRateIndex.set(idx);
    this.editBaseRateValue = card.baseRate;
    this.editAddlRateValue = card.additionalRate;
    this.editFuelSurchargeValue = card.fuelSurcharge;
  }

  saveRate(idx: number) {
    this.rateCards.update(cards => {
      const copy = [...cards];
      copy[idx] = {
        ...copy[idx],
        baseRate: this.editBaseRateValue,
        additionalRate: this.editAddlRateValue,
        fuelSurcharge: this.editFuelSurchargeValue
      };
      return copy;
    });
    this.editingRateIndex.set(null);
    this.showNotification("Rate card updated successfully.");
  }

  cancelEditRate() {
    this.editingRateIndex.set(null);
  }

  toggleCourierActive(idx: number) {
    this.rateCards.update(cards => {
      const copy = [...cards];
      copy[idx].active = !copy[idx].active;
      return copy;
    });
    const status = this.rateCards()[idx].active ? "activated" : "deactivated";
    this.showNotification(`Courier partner ${this.rateCards()[idx].courier} has been ${status}.`);
  }

  // Slab actions
  startEditSlab(slab: WeightSlab) {
    this.editingSlabId.set(slab.id);
    this.editSlabName = slab.name;
    this.editSlabIncrement = slab.increment;
  }

  saveSlab(id: string) {
    this.weightSlabs.update(slabs => {
      return slabs.map(s => s.id === id ? { ...s, name: this.editSlabName, increment: this.editSlabIncrement } : s);
    });
    this.editingSlabId.set(null);
    this.showNotification("Weight slab configured successfully.");
  }

  cancelEditSlab() {
    this.editingSlabId.set(null);
  }

  // Global settings save
  saveGlobalSettings() {
    this.showNotification("Global surcharge adjustments saved successfully.");
  }
}
