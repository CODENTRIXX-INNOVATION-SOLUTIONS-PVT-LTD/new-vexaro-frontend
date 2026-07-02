import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Papa from "papaparse";

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

  selectedFile = signal<File | null>(null);

  fileName = signal("");

  uploadProgress = signal(0);

  totalRows = signal(0);
  validRows = signal(0);
  errorCount = signal(0);

  parsingErrors = signal<ParsingError[]>([]);

  notificationMessage = signal<string | null>(null);

  csvHeaders = signal<string[]>([]);
  csvPreview = signal<any[]>([]);

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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {

        this.csvHeaders.set(result.meta.fields ?? []);
        this.csvPreview.set(result.data.slice(0, 5));

        this.showNotification(`Selected file: ${file.name}`);
      }
    });

    input.value = "";
  }

  clearUpload() {

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
  }

  downloadSampleTemplate() {
    const link = document.createElement("a");
    link.href = "assets/bulk_shipments.csv";
    link.download = "bulk_shipments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showNotification("Sample CSV template downloaded successfully.");
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