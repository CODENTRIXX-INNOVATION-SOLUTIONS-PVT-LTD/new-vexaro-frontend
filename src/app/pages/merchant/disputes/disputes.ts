import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisputeService } from '../../../services/dispute.service';
import { finalize } from 'rxjs';

const CATEGORY_LABELS: Record<string, string> = {
  WEIGHT_DISPUTE: 'Weight Mismatch', LOST: 'Package Lost',
  DAMAGED: 'Damaged Package', DELAY: 'Delivery Delay',
  WRONG_DELIVERY: 'Incorrect Delivery', COD_MISMATCH: 'COD Cash Mismatch', OTHER: 'Other Issue',
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

  // ── List state ────────────────────────────────────────────────────────────
  private _disputes: any[] = [];
  isLoading  = signal(false);
  listError  = signal('');
  page = 1; total = 0;
  readonly limit = 20;
  get totalPages(): number { return Math.ceil(this.total / this.limit) || 1; }

  // Filters
  categoryFilter = signal('ALL');
  statusFilter   = signal('ALL');
  searchQuery    = signal('');

  // ── View ──────────────────────────────────────────────────────────────────
  viewMode        = signal<'list' | 'detail' | 'create'>('list');
  selectedDispute = signal<any>(null);

  // ── Create form fields — template binds to newAwb ─────────────────────────
  newAwb         = '';
  newCategory    = 'OTHER';
  newDescription = '';
  isCreating     = signal(false);
  createError    = signal('');

  // ── Comment ───────────────────────────────────────────────────────────────
  newCommentText = '';
  isCommenting   = signal(false);

  // ── Proof upload — template calls simulateFileSelect / simulatedUploads ──
  // Kept as simulated (no real file server) — just shows a local preview
  simulatedUploads    = signal<string[]>([]);
  isUploadingSimulated = signal(false);

  readonly categoryLabels = CATEGORY_LABELS;

  ngOnInit(): void { this.load(); }

  // ── List ──────────────────────────────────────────────────────────────────
  load(): void {
    this.isLoading.set(true);
    this.listError.set('');
    const params: any = { page: this.page, limit: this.limit };
    if (this.statusFilter() !== 'ALL') params.status = this.statusFilter();

    this.disputeService.listDisputes(params).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (res) => {
        this.total      = res?.meta?.total ?? 0;
        const raw: any[] = res?.data?.disputes ?? res?.data?.items ?? [];
        this._disputes  = raw.map(d => this.mapDispute(d));
      },
      error: (err) => this.listError.set(err?.error?.message || 'Failed to load disputes.'),
    });
  }

  private mapDispute(d: any): any {
    return {
      id:             d._id,
      awb:            d.shipmentId?.awb ?? d.shipmentAWB ?? '—',
      shipmentId:     d.shipmentId?._id ?? d.shipmentId ?? '',
      category:       d.category,
      status:         d.status,
      createdAt:      d.createdAt,
      description:    d.description,
      originalWeight: d.billedWeight   ?? null,
      actualWeight:   d.actualWeight   ?? null,
      extraCharge:    d.extraCharge    ?? null,
      proofImages:    d.proofImages    ?? [],
      comments: (d.replies ?? d.comments ?? []).map((r: any) => ({
        sender: r.sender?.role === 'MERCHANT'     ? 'Merchant'
               : r.sender?.role === 'SUPER_ADMIN' ? 'Super Admin'
               : r.sender?.role === 'DISTRIBUTOR' ? 'Distributor' : 'Support',
        text:   r.message ?? r.text ?? '',
        date:   r.createdAt ?? r.date ?? '',
      })),
    };
  }

  applyFilters(): void { this.page = 1; this.load(); }

  // Template calls getFilteredDisputes()
  getFilteredDisputes(): any[] {
    const q   = this.searchQuery().trim().toLowerCase();
    const cat = this.categoryFilter();
    return this._disputes.filter(d =>
      (!q   || (d.id || '').toLowerCase().includes(q) || (d.awb || '').toLowerCase().includes(q)) &&
      (cat === 'ALL' || d.category === cat)
    );
  }

  // ── Detail ────────────────────────────────────────────────────────────────
  selectDispute(dispute: any): void {
    this.viewMode.set('detail');
    this.disputeService.getDisputeById(dispute.id).subscribe({
      next:  (res) => this.selectedDispute.set(this.mapDispute(res?.data ?? res)),
      error: ()    => this.selectedDispute.set(dispute),
    });
  }

  closeDetail(): void { this.selectedDispute.set(null); this.viewMode.set('list'); }

  // ── Create ────────────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.newAwb = ''; this.newCategory = 'OTHER'; this.newDescription = '';
    this.createError.set('');
    this.viewMode.set('create');
  }

  closeCreateForm(): void { this.viewMode.set('list'); }

  createDispute(): void {
    if (!this.newAwb.trim() || !this.newDescription.trim()) {
      this.createError.set('AWB and description are required.');
      return;
    }
    this.isCreating.set(true);
    this.createError.set('');

    this.disputeService.createDispute({
      shipmentId:  this.newAwb.trim(),
      category:    this.newCategory,
      description: this.newDescription.trim(),
    }).pipe(finalize(() => this.isCreating.set(false))).subscribe({
      next: () => { this.viewMode.set('list'); this.load(); },
      error: (err) => this.createError.set(err?.error?.message || 'Failed to create dispute.'),
    });
  }

  // ── Comment ───────────────────────────────────────────────────────────────
  addComment(): void {
    const text    = this.newCommentText.trim();
    const dispute = this.selectedDispute();
    if (!text || !dispute) return;

    this.isCommenting.set(true);
    this.disputeService.addComment(dispute.id, text).pipe(
      finalize(() => this.isCommenting.set(false)),
    ).subscribe({
      next: () => { this.newCommentText = ''; this.selectDispute(dispute); },
      error: () => {
        // Optimistic local append
        this.selectedDispute.update(d => d
          ? { ...d, comments: [...d.comments, { sender: 'Merchant', text, date: new Date().toISOString() }] }
          : d
        );
        this.newCommentText = '';
      },
    });
  }

  // ── Simulated file upload (template calls simulateFileSelect) ─────────────
  simulateFileSelect(): void {
    this.isUploadingSimulated.set(true);
    setTimeout(() => {
      this.isUploadingSimulated.set(false);
      const placeholders = [
        'https://placehold.co/200x200?text=Proof+1',
        'https://placehold.co/200x200?text=Proof+2',
        'https://placehold.co/200x200?text=Proof+3',
      ];
      const next = placeholders[this.simulatedUploads().length % placeholders.length];
      this.simulatedUploads.update(u => [...u, next]);
    }, 800);
  }

  removeSimulatedUpload(idx: number): void {
    this.simulatedUploads.update(u => u.filter((_, i) => i !== idx));
  }

  // Submit the simulated (or real) proof URLs
  submitProof(): void {
    const dispute = this.selectedDispute();
    if (!dispute || !this.simulatedUploads().length) return;

    this.disputeService.submitProof(dispute.id, this.simulatedUploads()).subscribe({
      next: () => {
        this.simulatedUploads.set([]);
        this.selectDispute(dispute);
      },
      error: () => { /* non-critical — just clear uploads */ this.simulatedUploads.set([]); },
    });
  }
}
