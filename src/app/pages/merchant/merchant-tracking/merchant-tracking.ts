import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface TrackingCheckpoint {
  time: string;
  location: string;
  status: string;
  description: string;
}

interface ShipmentDetails {
  awb: string;
  courierName: string;
  status: "Delivered" | "In Transit" | "Out for Delivery" | "Created";
  origin: string;
  destination: string;
  recipientName: string;
  recipientPhone: string;
  estimatedDelivery: string;
  checkpoints: TrackingCheckpoint[];
}

@Component({
  selector: "app-merchant-tracking",
  imports: [CommonModule, FormsModule],
  templateUrl: "./merchant-tracking.html",
  styleUrl: "./merchant-tracking.css",
})
export class MerchantTracking {
  searchQuery = signal<string>("");
  searchedAWB = signal<string | null>(null);

  // Database of mock tracking states
  trackingDatabase: Record<string, ShipmentDetails> = {
    "VX-982341205": {
      awb: "VX-982341205",
      courierName: "Delhivery Air",
      status: "Delivered",
      origin: "New Delhi Warehouse",
      destination: "Bengaluru, Karnataka",
      recipientName: "Rajesh Kumar",
      recipientPhone: "98765 43210",
      estimatedDelivery: "2026-06-24",
      checkpoints: [
        { time: "2026-06-24 15:30", location: "Bengaluru City Hub", status: "Delivered", description: "Shipment delivered successfully to recipient." },
        { time: "2026-06-24 09:15", location: "Bengaluru South Terminal", status: "Out for Delivery", description: "Out for delivery with courier associate Ramesh." },
        { time: "2026-06-23 22:40", location: "Bengaluru Main Hub", status: "In Transit", description: "Received at Bengaluru Main Hub facility." },
        { time: "2026-06-23 11:30", location: "Mumbai Processing Hub", status: "In Transit", description: "In transit. Dispatched from Mumbai airport terminal." },
        { time: "2026-06-22 18:20", location: "Delhi Warehouse Terminal", status: "In Transit", description: "Item sorted and loaded into transport truck." },
        { time: "2026-06-22 14:00", location: "Delhi Warehouse Terminal", status: "Created", description: "Manifest printed and package hand-over completed." }
      ]
    },
    "VX-982341289": {
      awb: "VX-982341289",
      courierName: "BlueDart Express",
      status: "In Transit",
      origin: "Surat Hub",
      destination: "Pune, Maharashtra",
      recipientName: "Karan Desai",
      recipientPhone: "91234 56789",
      estimatedDelivery: "2026-06-27",
      checkpoints: [
        { time: "2026-06-25 08:30", location: "Mumbai Hub Sorting", status: "In Transit", description: "Arrived at Mumbai Hub terminal sorting conveyor." },
        { time: "2026-06-24 20:00", location: "Surat Warehouse Terminal", status: "In Transit", description: "Dispatched from Surat and in route to Mumbai." },
        { time: "2026-06-24 16:45", location: "Surat Warehouse Terminal", status: "Created", description: "Shipment booked and manifest generated." }
      ]
    }
  };

  activeDetails = signal<ShipmentDetails | null>(null);
  hasSearched = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  trackShipment() {
    const rawQuery = this.searchQuery().trim();
    if (!rawQuery) return;

    this.hasSearched.set(true);
    const details = this.trackingDatabase[rawQuery];
    
    if (details) {
      this.activeDetails.set(details);
      this.searchedAWB.set(rawQuery);
      this.errorMessage.set(null);
    } else {
      this.activeDetails.set(null);
      this.searchedAWB.set(null);
      this.errorMessage.set(`AWB Tracking ID "${rawQuery}" could not be located in our system logs.`);
    }
  }

  quickTrack(awb: string) {
    this.searchQuery.set(awb);
    this.trackShipment();
  }
}
