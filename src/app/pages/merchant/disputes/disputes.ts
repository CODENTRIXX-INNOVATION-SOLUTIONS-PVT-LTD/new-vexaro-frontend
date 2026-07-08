import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { DisputeService } from '../../../services/dispute.service';
import { SupportService } from '../../../services/support.service';

const CATEGORY_LABELS: Record<string, string> = {
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
  isUploadingAttachments = signal(false);
  createError = signal('');
  createFiles = signal<File[]>([]);
  createAttachmentError = signal('');

  newCommentText = '';
  isCommenting = signal(false);
  commentError = signal('');
  isClosing = signal(false);

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
      attachments: d.attachments ?? (d.proofImages ?? []).map((url: string) => ({ url, name: 'Proof image' })),
      comments: (d.replies ?? d.comments ?? []).map((reply: any) => ({
        sender: reply.sender?.role === 'MERCHANT' || reply.author?.role === 'MERCHANT' ? 'Merchant'
          : reply.sender?.role === 'SUPER_ADMIN' || reply.author?.role === 'SUPER_ADMIN' ? 'Super Admin'
          : reply.sender?.role === 'DISTRIBUTOR' || reply.author?.role === 'DISTRIBUTOR' ? 'Distributor'
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
    this.commentError.set('');
    this.disputeService.getDisputeById(dispute.id).subscribe({
      next: (res) => this.selectedDispute.set(this.mapDispute(res?.data ?? res)),
      error: () => this.selectedDispute.set(dispute),
    });
  }

  closeDetail(): void {
    this.selectedDispute.set(null);
    this.newCommentText = '';
    this.commentError.set('');
    this.viewMode.set('list');
  }

  openCreateForm(): void {
    this.newAwb = '';
    this.newCategory = 'OTHER';
    this.newDescription = '';
    this.createError.set('');
    this.createAttachmentError.set('');
    this.createFiles.set([]);
    this.viewMode.set('create');
  }

  closeCreateForm(): void {
    this.createFiles.set([]);
    this.createError.set('');
    this.createAttachmentError.set('');
    this.viewMode.set('list');
  }

  createDispute(): void {
    if (!this.newAwb.trim()) {
      this.createError.set('AWB tracking number is required.');
      return;
    }
    if (this.newDescription.trim().length < 10) {
      this.createError.set('Description must be at least 10 characters.');
      return;
    }

    this.isCreating.set(true);
    this.createError.set('');
    this.createAttachmentError.set('');

    const files = this.createFiles();
    if (files.length) {
      this.isUploadingAttachments.set(true);
      forkJoin(files.map(file => this.supportService.uploadAttachment(file))).subscribe({
        next: (uploadResponses) => {
          const attachments = uploadResponses
            .map((res, index) => ({ url: res?.data?.url, name: files[index]?.name || 'Attachment' }))
            .filter(item => Boolean(item.url));
          this.isUploadingAttachments.set(false);
          this.submitDisputeCreate(attachments);
        },
        error: (err) => {
          this.isCreating.set(false);
          this.isUploadingAttachments.set(false);
          this.createAttachmentError.set(err?.error?.message || 'Failed to upload dispute proof.');
        },
      });
      return;
    }

    this.submitDisputeCreate([]);
  }

  private submitDisputeCreate(attachments: Array<{ url: string; name: string }>): void {
    this.disputeService.createDispute({
      shipmentAwb: this.newAwb.trim(),
      category: this.newCategory,
      description: this.newDescription.trim(),
      ...(attachments.length ? { attachments } : {}),
    }).pipe(finalize(() => this.isCreating.set(false))).subscribe({
      next: () => {
        this.createFiles.set([]);
        this.viewMode.set('list');
        this.load();
      },
      error: (err) => this.createError.set(err?.error?.message || 'Failed to create dispute.'),
    });
  }

  onCreateFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createFiles.set(Array.from(input.files || []));
    this.createAttachmentError.set('');
    input.value = '';
  }

  removeCreateFile(index: number): void {
    this.createFiles.update(files => files.filter((_, i) => i !== index));
  }

  addComment(): void {
    const text = this.newCommentText.trim();
    const dispute = this.selectedDispute();
    if (!text || !dispute) return;

    this.isCommenting.set(true);
    this.commentError.set('');
    this.disputeService.addComment(dispute.id, text).pipe(
      finalize(() => this.isCommenting.set(false)),
    ).subscribe({
      next: () => {
        this.newCommentText = '';
        this.selectDispute(dispute);
      },
      error: (err) => this.commentError.set(err?.error?.message || 'Failed to post message.'),
    });
  }

  closeResolvedDispute(): void {
    const dispute = this.selectedDispute();
    if (!dispute || dispute.status !== 'RESOLVED') return;

    this.isClosing.set(true);
    this.commentError.set('');
    this.disputeService.closeDispute(dispute.id).pipe(
      finalize(() => this.isClosing.set(false)),
    ).subscribe({
      next: (res) => {
        this.selectedDispute.set(this.mapDispute(res?.data ?? res));
        this.load();
      },
      error: (err) => this.commentError.set(err?.error?.message || 'Failed to close dispute.'),
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  resolveProofUrl(url: string): string {
    if (!url || /^https?:\/\//i.test(url)) return url;
    return `${this.apiOrigin}${url.startsWith('/') ? url : '/' + url}`;
  }
}
