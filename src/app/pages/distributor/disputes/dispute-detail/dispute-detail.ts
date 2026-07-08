import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DisputeService } from '../../../../services/dispute.service';

const CATEGORY_LABELS: Record<string, string> = {
  LOST: 'Lost Package',
  DAMAGED: 'Damaged',
  DELAY: 'Delivery Delay',
  WRONG_DELIVERY: 'Wrong Delivery',
  COD_MISMATCH: 'COD Mismatch',
  OTHER: 'Other',
};

@Component({
  selector: 'app-dispute-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-detail.html',
  styleUrl: './dispute-detail.css',
})
export class DisputeDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private disputeService = inject(DisputeService);
  private destroy$ = new Subject<void>();

  disputeId = '';
  isLoading = false;
  isSubmitting = false;
  error = '';
  commentText = '';
  resolutionText = '';
  readonly categoryLabels = CATEGORY_LABELS;

  dispute: any = null;

  ngOnInit(): void {
    this.disputeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDisputeDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDisputeDetails(): void {
    this.isLoading = true;
    this.error = '';
    this.disputeService.getDisputeById(this.disputeId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res) => {
          const d = res?.data ?? res;
          this.dispute = this.mapDispute(d);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load dispute details.';
        },
      });
  }

  private mapDispute(d: any): any {
    return {
      id: d._id,
      awb: d.shipmentId?.awb || '-',
      carrier: d.shipmentId?.carrier || '-',
      merchantName: d.raisedBy ? `${d.raisedBy.firstName || ''} ${d.raisedBy.lastName || ''}`.trim() : '-',
      merchantEmail: d.raisedBy?.email || '-',
      category: d.category,
      status: d.status,
      description: d.description || '-',
      resolution: d.resolution || '',
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
      attachments: d.attachments || [],
      comments: (d.comments || []).map((comment: any) => ({
        author: comment.author?.role === 'MERCHANT' ? 'Merchant'
          : comment.author?.role === 'DISTRIBUTOR' ? 'Distributor'
          : comment.author?.role === 'SUPER_ADMIN' ? 'Super Admin'
          : 'User',
        text: comment.text || '',
        createdAt: comment.createdAt,
      })),
    };
  }

  markInReview(): void {
    if (!this.dispute || !['OPEN'].includes(this.dispute.status)) return;
    this.submitUpdate({ status: 'IN_REVIEW' });
  }

  resolveDispute(): void {
    const resolution = this.resolutionText.trim();
    if (!this.dispute || !resolution) {
      this.error = 'Resolution note is required.';
      return;
    }
    this.submitUpdate({ resolution });
  }

  closeDispute(): void {
    if (!this.dispute || this.dispute.status !== 'RESOLVED') return;
    this.submitUpdate({ status: 'CLOSED' });
  }

  addComment(): void {
    const comment = this.commentText.trim();
    if (!this.dispute || !comment) return;
    this.submitUpdate({ comment }, () => { this.commentText = ''; });
  }

  private submitUpdate(payload: any, afterSuccess?: () => void): void {
    this.isSubmitting = true;
    this.error = '';
    this.disputeService.updateDispute(this.dispute.id, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSubmitting = false; }))
      .subscribe({
        next: (res) => {
          if (afterSuccess) afterSuccess();
          this.dispute = this.mapDispute(res?.data ?? res);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to update dispute.';
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/distributor/disputes']);
  }
}
