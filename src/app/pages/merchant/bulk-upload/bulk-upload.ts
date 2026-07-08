import { Component, OnDestroy, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Papa from "papaparse";
import { ShipmentService } from "../../../services/shipment.service";

interface ParsingError {
  row: number;
  field: string;
  value: string;
  reason: string;
}

const REQUIRED_HEADERS = [
  'origin_name', 'origin_phone', 'origin_address', 'origin_city', 'origin_state', 'origin_pincode',
  'dest_name', 'dest_phone', 'dest_address', 'dest_city', 'dest_state', 'dest_pincode',
  'weight', 'length', 'breadth', 'height',
  'product_name', 'sku', 'units', 'selling_price', 'discount', 'tax',
  'declared_value', 'payment_method', 'cod_amount',
];

@Component({
  selector: "app-bulk-upload",
  imports: [CommonModule, FormsModule],
  templateUrl: "./bulk-upload.html",
  styleUrl: "./bulk-upload.css",
})
export class BulkUpload implements OnDestroy {
  private shipmentService = inject(ShipmentService);
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  uploadState = signal<"idle" | "uploading" | "queued" | "processing" | "complete" | "failed">("idle");

  selectedFile = signal<File | null>(null);

  fileName = signal("");

  uploadProgress = signal(0);

  totalRows = signal(0);
  validRows = signal(0);
  errorCount = signal(0);

  parsingErrors = signal<ParsingError[]>([]);

  notificationMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  jobId = signal<string | null>(null);

  csvHeaders = signal<string[]>([]);
  csvPreview = signal<any[]>([]);

  ngOnDestroy(): void {
    this.clearPollTimer();
  }

  showNotification(msg: string) {
    this.notificationMessage.set(msg);

    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.selectedFile.set(file);
    this.fileName.set(file.name);
    this.errorMessage.set(null);
    this.jobId.set(null);
    this.uploadState.set("idle");
    this.uploadProgress.set(0);
    this.parsingErrors.set([]);

    if (/\.csv$/i.test(file.name)) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = (result.meta.fields ?? []).map(h => h.trim());
          this.csvHeaders.set(headers);
          this.csvPreview.set(result.data.slice(0, 5));

          const normalized = headers.map(h => h.toLowerCase());
          const missing = REQUIRED_HEADERS.filter(header => !normalized.includes(header));
          if (missing.length) {
            this.errorMessage.set(`Missing required columns: ${missing.join(", ")}`);
          }

          this.showNotification(`Selected file: ${file.name}`);
        }
      });
    } else {
      this.csvHeaders.set([]);
      this.csvPreview.set([]);
      this.showNotification(`Selected Excel file: ${file.name}`);
    }

    input.value = "";
  }

  clearUpload() {
    this.clearPollTimer();

    this.selectedFile.set(null);
    this.fileName.set("");

    this.csvHeaders.set([]);
    this.csvPreview.set([]);

    this.uploadState.set("idle");

    this.uploadProgress.set(0);

    this.totalRows.set(0);
    this.validRows.set(0);
    this.errorCount.set(0);

    this.parsingErrors.set([]);
    this.errorMessage.set(null);
    this.jobId.set(null);
  }

  downloadSampleTemplate() {
    const link = document.createElement("a");
    link.href = "assets/bulk_shipments.csv";
    link.download = "bulk_shipments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showNotification("CSV template downloaded successfully.");
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set("Please select a CSV or Excel file first.");
      return;
    }
    if (/\.csv$/i.test(file.name) && this.errorMessage()?.startsWith("Missing required columns")) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    this.clearPollTimer();
    this.errorMessage.set(null);
    this.uploadState.set("uploading");
    this.uploadProgress.set(5);
    this.totalRows.set(0);
    this.validRows.set(0);
    this.errorCount.set(0);
    this.parsingErrors.set([]);

    this.shipmentService.bulkUpload(formData).subscribe({
      next: (res) => {
        const data = res?.data || {};
        this.jobId.set(data.jobId || null);
        this.uploadState.set("queued");
        this.uploadProgress.set(10);
        this.showNotification(res?.message || "Bulk upload queued.");
        if (data.jobId) this.pollStatus(data.jobId);
      },
      error: (err) => {
        this.uploadState.set("failed");
        this.uploadProgress.set(0);
        this.errorMessage.set(err?.error?.message || "Bulk upload failed. Please check the file and try again.");
      },
    });
  }

  private pollStatus(jobId: string): void {
    this.shipmentService.getBulkUploadStatus(jobId).subscribe({
      next: (res) => {
        const data = res?.data || {};
        const total = Number(data.totalRows || 0);
        const created = Number(data.createdRows || 0);
        const failed = Number(data.failedRows || 0);
        const processed = created + failed;
        const status = String(data.status || "").toUpperCase();

        this.totalRows.set(total);
        this.validRows.set(created);
        this.errorCount.set(failed);
        this.parsingErrors.set((data.errors || []).map((error: any, index: number) => ({
          row: Number(error?.row || index + 1),
          field: "row",
          value: "-",
          reason: String(error?.reason || error),
        })));
        this.uploadProgress.set(total ? Math.min(100, Math.round((processed / total) * 100)) : 10);

        if (status === "COMPLETED") {
          this.uploadState.set("complete");
          this.uploadProgress.set(100);
          this.showNotification("Bulk shipment upload completed.");
          this.clearPollTimer();
          return;
        }

        if (status === "FAILED") {
          this.uploadState.set("failed");
          this.errorMessage.set(data.fatalError || "Bulk upload failed during processing.");
          this.clearPollTimer();
          return;
        }

        this.uploadState.set(status === "PROCESSING" ? "processing" : "queued");
        this.pollTimer = setTimeout(() => this.pollStatus(jobId), 2000);
      },
      error: (err) => {
        this.uploadState.set("failed");
        this.errorMessage.set(err?.error?.message || "Unable to fetch bulk upload status.");
        this.clearPollTimer();
      },
    });
  }

  private clearPollTimer(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  getFileSize(): string {

    if (!this.selectedFile()) return "";

    const size = this.selectedFile()!.size;

    if (size < 1024) {
      return `${size} Bytes`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

}
