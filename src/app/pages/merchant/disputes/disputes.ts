import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { DisputeService } from '../../../services/dispute.service';
import { SupportService } from '../../../services/support.service';

const CATEGORY_LABELS: Record<string, string> = {
  WEIGHT_DISPUTE: 'Weight Mismatch',
  LOST: 'Package Lost',
  DAMAGED: 'Damaged Package',
  DELAY: 'Delivery Delay',
  WRONG_DELIVERY: 'Incorrect Delivery',
  COD_MISMATCH: 'COD Cash Mismatch',
  OTHER: 'Other Issue',
};

@Component({
  selector: 'app-merchant-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disputes.html',
  styleUrls: ['./disputes.css'],
})
export class MerchantDisputesComponent implements OnInit {
  private disputeService = inject(DisputeService);
  private supportService = inject(SupportService);
  private readonly apiOrigin = ((window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

  private _disputes: any[] = [];
  isLoading = signal(false);
  listError = signal('');
  page = 1;
  total = 0;
  readonly limit = 20;
  get totalPages(): number { return Math.ceil(this.total / this.limit) || 1; }

  categoryFilter = signal('ALL');
  statusFilter = signal('ALL');
  searchQuery = signal('');

  viewMode = signal<'list' | 'detail' | 'create'>('list');
  selectedDispute = signal<any>(null);

  newAwb = '';
  newCategory = 'OTHER';
  newDescription = '';
  isCreating = signal(false);
  createError = signal('');

  newCommentText = '';
  isCommenting = signal(false);

  proofFiles = signal<File[]>([]);
  isUploadingProof = signal(false);
  proofUploadError = signal('');

  readonly categoryLabels = CATEGORY_LABELS;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.listError.set('');
    const params: any = { page: this.page, limit: this.limit };
    if (this.statusFilter() !== 'ALL') params.status = this.statusFilter();

    this.disputeService.listDisputes(params).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (res) => {
        this.total = res?.meta?.total ?? 0;
        const raw: any[] = res?.data?.disputes ?? res?.data?.items ?? [];
        this._disputes = raw.map(d => this.mapDispute(d));
      },
      error: (err) => this.listError.set(err?.error?.message || 'Failed to load disputes.'),
    });
  }

  private mapDispute(d: any): any {
    return {
      id: d._id,
      awb: d.shipmentId?.awb ?? d.shipmentAWB ?? '-',
      shipmentId: d.shipmentId?._id ?? d.shipmentId ?? '',
      category: d.category,
      status: d.status,
      createdAt: d.createdAt,
      description: d.description,
      originalWeight: d.billedWeight ?? null,
      actualWeight: d.actualWeight ?? null,
      extraCharge: d.extraCharge ?? null,
      proofImages: d.proofImages ?? [],
      comments: (d.replies ?? d.comments ?? []).map((reply: any) => ({
        sender: reply.sender?.role === 'MERCHANT' ? 'Merchant'
          : reply.sender?.role === 'SUPER_ADMIN' ? 'Super Admin'
          : reply.sender?.role === 'DISTRIBUTOR' ? 'Distributor'
          : 'Support',
        text: reply.message ?? reply.text ?? '',
        date: reply.createdAt ?? reply.date ?? '',
      })),
    };
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  getFilteredDisputes(): any[] {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.categoryFilter();
    return this._disputes.filter(dispute =>
      (!query || (dispute.id || '').toLowerCase().includes(query) || (dispute.awb || '').toLowerCase().includes(query)) &&
      (category === 'ALL' || dispute.category === category),
    );
  }

  selectDispute(dispute: any): void {
    this.viewMode.set('detail');
    this.proofFiles.set([]);
    this.proofUploadError.set('');
    this.disputeService.getDisputeById(dispute.id).subscribe({
      next: (res) => this.selectedDispute.set(this.mapDispute(res?.data ?? res)),
      error: () => this.selectedDispute.set(dispute),
    });
  }

  closeDetail(): void {
    this.selectedDispute.set(null);
    this.viewMode.set('list');
  }

  openCreateForm(): void {
    this.newAwb = '';
    this.newCategory = 'OTHER';
    this.newDescription = '';
    this.createError.set('');
    this.viewMode.set('create');
  }

  closeCreateForm(): void {
    this.viewMode.set('list');
  }

  createDispute(): void {
    if (!this.newAwb.trim() || !this.newDescription.trim()) {
      this.createError.set('AWB and description are required.');
      return;
    }

    this.isCreating.set(true);
    this.createError.set('');
    this.disputeService.createDispute({
      shipmentId: this.newAwb.trim(),
      category: this.newCategory,
      description: this.newDescription.trim(),
    }).pipe(finalize(() => this.isCreating.set(false))).subscribe({
      next: () => {
        this.viewMode.set('list');
        this.load();
      },
      error: (err) => this.createError.set(err?.error?.message || 'Failed to create dispute.'),
    });
  }

  addComment(): void {
    const text = this.newCommentText.trim();
    const dispute = this.selectedDispute();
    if (!text || !dispute) return;

    this.isCommenting.set(true);
    this.disputeService.addComment(dispute.id, text).pipe(
      finalize(() => this.isCommenting.set(false)),
    ).subscribe({
      next: () => {
        this.newCommentText = '';
        this.selectDispute(dispute);
      },
      error: () => {
        this.selectedDispute.update(current => current
          ? { ...current, comments: [...current.comments, { sender: 'Merchant', text, date: new Date().toISOString() }] }
          : current,
        );
        this.newCommentText = '';
      },
    });
  }

  onProofFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFiles.set(Array.from(input.files || []));
    this.proofUploadError.set('');
    input.value = '';
  }

  removeProofFile(index: number): void {
    this.proofFiles.update(files => files.filter((_, i) => i !== index));
  }

  submitProof(): void {
    const dispute = this.selectedDispute();
    const files = this.proofFiles();
    if (!dispute || !files.length || this.isUploadingProof()) return;

    this.isUploadingProof.set(true);
    this.proofUploadError.set('');
    forkJoin(files.map(file => this.supportService.uploadAttachment(file))).subscribe({
      next: (uploadResponses) => {
        const proofUrls = uploadResponses.map(res => res?.data?.url).filter(Boolean);
        this.disputeService.submitProof(dispute.id, proofUrls).pipe(
          finalize(() => this.isUploadingProof.set(false)),
        ).subscribe({
          next: () => {
            this.proofFiles.set([]);
            this.selectDispute(dispute);
          },
          error: (err) => this.proofUploadError.set(err?.error?.message || 'Failed to submit proof.'),
        });
      },
      error: (err) => {
        this.isUploadingProof.set(false);
        this.proofUploadError.set(err?.error?.message || 'Failed to upload proof files.');
      },
    });
  }

  resolveProofUrl(url: string): string {
    if (!url || /^https?:\/\//i.test(url)) return url;
    return `${this.apiOrigin}${url.startsWith('/') ? url : '/' + url}`;
  }
}
