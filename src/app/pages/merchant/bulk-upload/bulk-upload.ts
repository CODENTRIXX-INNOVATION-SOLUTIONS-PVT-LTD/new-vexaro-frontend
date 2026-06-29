import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface ParsingError {
  row: number;
  field: string;
  value: string;
  reason: string;
}

@Component({
  selector: "app-bulk-upload",
  imports: [CommonModule, FormsModule],
  templateUrl: "./bulk-upload.html",
  styleUrl: "./bulk-upload.css",
})
export class BulkUpload {
  uploadState = signal<"idle" | "uploading" | "parsing" | "complete">("idle");
  uploadProgress = signal<number>(0);
  fileName = signal<string>("");

  totalRows = signal<number>(0);
  validRows = signal<number>(0);
  errorCount = signal<number>(0);

  parsingErrors = signal<ParsingError[]>([]);

  notificationMessage = signal<string | null>(null);

  showNotification(msg: string) {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  // Triggered by clicking dropzone
  simulateFileSelection() {
    if (this.uploadState() !== "idle") return;

    this.fileName.set("shipments_bulk_june2026.csv");
    this.uploadState.set("uploading");
    this.uploadProgress.set(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress.update(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          this.triggerParsing();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  }

  triggerParsing() {
    this.uploadState.set("parsing");
    
    // Simulate short parsing delay
    setTimeout(() => {
      this.totalRows.set(128);
      this.validRows.set(123);
      this.errorCount.set(5);
      
      this.parsingErrors.set([
        { row: 14, field: "Recipient Phone", value: "98765", reason: "Phone number must be exactly 10 digits." },
        { row: 32, field: "Pincode", value: "ABC123", reason: "Invalid postal code format for destination." },
        { row: 45, field: "Declared Value", value: "-250", reason: "Value cannot be negative." },
        { row: 78, field: "Pincode", value: "999999", reason: "Service unavailable at specified pincode." },
        { row: 102, field: "COD Amount", value: "60000", reason: "COD collection limit exceeds maximum ₹50,000 threshold." }
      ]);

      this.uploadState.set("complete");
      this.showNotification("CSV parsed. Verification results loaded below.");
    }, 1200);
  }

  clearUpload() {
    this.uploadState.set("idle");
    this.uploadProgress.set(0);
    this.fileName.set("");
    this.totalRows.set(0);
    this.validRows.set(0);
    this.errorCount.set(0);
    this.parsingErrors.set([]);
  }

  processUpload() {
    if (this.validRows() === 0) return;
    this.showNotification(`Successfully queued ${this.validRows()} shipments for booking!`);
    this.clearUpload();
  }

  downloadSampleTemplate() {
    this.showNotification("Sample CSV template downloaded successfully.");
  }
}
