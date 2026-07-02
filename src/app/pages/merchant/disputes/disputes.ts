import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface Comment {
  sender: "Merchant" | "Super Admin" | "Distributor";
  text: string;
  date: string;
}

interface Dispute {
  id: string;
  awb: string;
  category: "WEIGHT_DISPUTE" | "LOST" | "DAMAGED" | "DELAY" | "WRONG_DELIVERY" | "COD_MISMATCH" | "OTHER";
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  createdAt: string;
  description: string;
  originalWeight?: number;
  actualWeight?: number;
  extraCharge?: number;
  proofImages: string[];
  comments: Comment[];
}

@Component({
  selector: "app-merchant-disputes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./disputes.html",
  styleUrls: ["./disputes.css"],
})
export class MerchantDisputesComponent {
  // Mock disputes list
  disputes = signal<Dispute[]>([
    {
      id: "DISP-20260601",
      awb: "VX-982341203",
      category: "WEIGHT_DISPUTE",
      status: "OPEN",
      createdAt: "2026-06-20T10:15:00Z",
      description: "Auto-generated weight dispute. Manifested weight is 0.5 kg, audited weight is 2.50 kg.",
      originalWeight: 0.5,
      actualWeight: 2.50,
      extraCharge: 120.00,
      proofImages: [],
      comments: [
        { sender: "Super Admin", text: "Weight audited at hub during scan. Extra charge applied to your wallet.", date: "2026-06-20T10:15:00Z" },
        { sender: "Merchant", text: "I am verifying this with my physical invoice copy. I will upload package proof.", date: "2026-06-21T14:30:00Z" },
      ],
    },
    {
      id: "DISP-20260603",
      awb: "VX-982341289",
      category: "DAMAGED",
      status: "IN_REVIEW",
      createdAt: "2026-06-22T08:12:00Z",
      description: "Customer reported that the packaging box was crushed during delivery, causing damage to the items inside.",
      proofImages: ["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=200"],
      comments: [
        { sender: "Merchant", text: "Customer received a crushed cardboard box. Attached is the customer photo.", date: "2026-06-22T08:12:00Z" },
        { sender: "Distributor", text: "Forwarded damage claim to Velocity courier logistics team. Under investigation.", date: "2026-06-23T11:45:00Z" },
      ],
    },
    {
      id: "DISP-20260599",
      awb: "VX-982341101",
      category: "LOST",
      status: "RESOLVED",
      createdAt: "2026-06-15T09:00:00Z",
      description: "Shipment has been stuck in 'ARRIVED_AT_HUB' for 12 days. Customer is calling for cancellation.",
      proofImages: [],
      comments: [
        { sender: "Merchant", text: "12 days no status change. Please declare this as lost and refund.", date: "2026-06-15T09:00:00Z" },
        { sender: "Super Admin", text: "Checked with hub manager. Package is declared lost in transit. Refund approved & credited to your wallet.", date: "2026-06-18T16:00:00Z" },
      ],
    },
  ]);

  // UI state
  viewMode = signal<"list" | "detail" | "create">("list");
  selectedDispute = signal<Dispute | null>(null);

  // Filters
  categoryFilter = signal<string>("ALL");
  statusFilter = signal<string>("ALL");
  searchQuery = signal<string>("");

  // Create dispute form fields
  newAwb = "";
  newCategory: Dispute["category"] = "OTHER";
  newDescription = "";

  // Comment input
  newCommentText = "";

  // Mock upload files list
  simulatedUploads = signal<string[]>([]);
  isUploadingSimulated = signal(false);

  categoryLabels: Record<string, string> = {
    WEIGHT_DISPUTE: "Weight Mismatch",
    LOST: "Package Lost",
    DAMAGED: "Damaged Package",
    DELAY: "Delivery Delay",
    WRONG_DELIVERY: "Incorrect Delivery",
    COD_MISMATCH: "COD Cash Mismatch",
    OTHER: "Other Issue",
  };

  getFilteredDisputes() {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.categoryFilter();
    const stat = this.statusFilter();

    return this.disputes().filter((d) => {
      const matchesSearch =
        d.id.toLowerCase().includes(query) || d.awb.toLowerCase().includes(query);
      const matchesCat = cat === "ALL" || d.category === cat;
      const matchesStat = stat === "ALL" || d.status === stat;
      return matchesSearch && matchesCat && matchesStat;
    });
  }

  selectDispute(dispute: Dispute): void {
    this.selectedDispute.set(dispute);
    this.simulatedUploads.set([]);
    this.viewMode.set("detail");
  }

  closeDetail(): void {
    this.selectedDispute.set(null);
    this.viewMode.set("list");
  }

  openCreateForm(): void {
    this.newAwb = "";
    this.newCategory = "OTHER";
    this.newDescription = "";
    this.viewMode.set("create");
  }

  closeCreateForm(): void {
    this.viewMode.set("list");
  }

  // Post comment inside dispute thread
  addComment(): void {
    const text = this.newCommentText.trim();
    const dispute = this.selectedDispute();
    if (!text || !dispute) return;

    const newComment: Comment = {
      sender: "Merchant",
      text: text,
      date: new Date().toISOString(),
    };

    // Update local list
    this.disputes.update((list) => {
      return list.map((d) => {
        if (d.id === dispute.id) {
          return {
            ...d,
            comments: [...d.comments, newComment],
          };
        }
        return d;
      });
    });

    // Update selected dispute view
    this.selectedDispute.update((d) => {
      if (d) {
        return {
          ...d,
          comments: [...d.comments, newComment],
        };
      }
      return null;
    });

    this.newCommentText = "";

    // Simulate Admin auto-reply in mock mode for dynamic feel
    setTimeout(() => {
      const adminReply: Comment = {
        sender: "Super Admin",
        text: `Under review. Thank you for posting details. Our dispute support team will check and update.`,
        date: new Date().toISOString(),
      };
      this.disputes.update((list) => {
        return list.map((d) => {
          if (d.id === dispute.id) {
            return {
              ...d,
              comments: [...d.comments, adminReply],
            };
          }
          return d;
        });
      });
      this.selectedDispute.update((d) => {
        if (d) {
          return {
            ...d,
            comments: [...d.comments, adminReply],
          };
        }
        return null;
      });
    }, 1500);
  }

  // Simulate file drag-and-drop / select
  simulateFileSelect(): void {
    this.isUploadingSimulated.set(true);
    setTimeout(() => {
      this.isUploadingSimulated.set(false);
      // Mocked image upload url
      const mockImgUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200";
      this.simulatedUploads.update((list) => [...list, mockImgUrl]);
    }, 800);
  }

  // Remove thumbnail
  removeSimulatedUpload(index: number): void {
    this.simulatedUploads.update((list) => list.filter((_, i) => i !== index));
  }

  // Submit proof for weight dispute
  submitProof(): void {
    const dispute = this.selectedDispute();
    const uploads = this.simulatedUploads();
    if (!dispute || uploads.length === 0) return;

    this.disputes.update((list) => {
      return list.map((d) => {
        if (d.id === dispute.id) {
          return {
            ...d,
            status: "IN_REVIEW",
            proofImages: [...d.proofImages, ...uploads],
          };
        }
        return d;
      });
    });

    this.selectedDispute.update((d) => {
      if (d) {
        return {
          ...d,
          status: "IN_REVIEW",
          proofImages: [...d.proofImages, ...uploads],
        };
      }
      return null;
    });

    this.simulatedUploads.set([]);

    // Add automated log comment
    const logComment: Comment = {
      sender: "Merchant",
      text: `Merchant submitted ${uploads.length} weight proof image(s) for verification. Status changed to In Review.`,
      date: new Date().toISOString(),
    };

    this.disputes.update((list) => {
      return list.map((d) => {
        if (d.id === dispute.id) {
          return {
            ...d,
            comments: [...d.comments, logComment],
          };
        }
        return d;
      });
    });

    this.selectedDispute.update((d) => {
      if (d) {
        return {
          ...d,
          comments: [...d.comments, logComment],
        };
      }
      return null;
    });
  }

  // Submit a new dispute
  createDispute(): void {
    if (!this.newAwb.trim() || !this.newDescription.trim()) return;

    const newId = `DISP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(this.disputes().length + 1).padStart(3, "0")}`;

    const newRec: Dispute = {
      id: newId,
      awb: this.newAwb.trim().toUpperCase(),
      category: this.newCategory,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      description: this.newDescription.trim(),
      proofImages: [],
      comments: [
        { sender: "Merchant", text: this.newDescription.trim(), date: new Date().toISOString() },
      ],
    };

    this.disputes.update((list) => [newRec, ...list]);
    this.viewMode.set("list");
  }
}
