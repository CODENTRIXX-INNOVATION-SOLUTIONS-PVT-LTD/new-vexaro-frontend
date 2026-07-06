import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { DisputeService } from '../../../../services/dispute.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-dispute-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-detail.html',
  styleUrl: './dispute-detail.css'
})
export class DisputeDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private disputeService = inject(DisputeService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  disputeId: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  userRole: string = '';

  dispute: any = {
    id: '',
    awb: '',
    merchantName: '',
    merchantCode: '',
    courier: '',
    status: 'Open',
    appliedWeight: 0,
    chargedWeight: 0,
    weightDifference: 0,
    extraChargeAmount: 0,
    deadlineDate: '',
    hoursLeft: 0,
    productName: '',
    boxDimensions: '',
    proofImages: []
  };

  // SA-only resolve action
  actionType: 'APPROVED' | 'REJECTED' | null = null;
  remarks: string = '';

  ngOnInit() {
    this.disputeId = this.route.snapshot.paramMap.get('id') || '';
    this.authService.getMe()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => { this.userRole = user.role; },
        error: () => {}
      });
    this.loadDisputeDetails();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDisputeDetails() {
    this.isLoading = true;
    this.disputeService.getDisputeById(this.disputeId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res) => {
          if (res.data) {
            const d = res.data;
            this.dispute = {
              id: d._id,
              awb: d.shipmentId?.awb || '—',
              merchantName: d.raisedBy ? `${d.raisedBy.firstName || ''} ${d.raisedBy.lastName || ''}`.trim() : '—',
              merchantCode: d.raisedBy?.email || '—',
              courier: d.shipmentId?.carrier || '—',
              status: d.status,
              appliedWeight: d.billedWeight || 0,
              chargedWeight: d.actualWeight || 0,
              weightDifference: Math.max(0, (d.actualWeight || 0) - (d.billedWeight || 0)),
              extraChargeAmount: d.extraCharge || 0,
              deadlineDate: d.disputeExpiresAt
                ? new Date(d.disputeExpiresAt).toLocaleDateString('en-IN')
                : '—',
              hoursLeft: d.disputeExpiresAt
                ? Math.max(0, Math.ceil((new Date(d.disputeExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
                : 0,
              productName: d.description || '—',
              boxDimensions: '—',
              proofImages: d.proofImages || []
            };
          }
        },
        error: (err) => { console.error('Failed to load dispute details:', err); }
      });
  }

  // Only SUPER_ADMIN can resolve — distributor has read-only view
  submitAction() {
    if (this.userRole !== 'SUPER_ADMIN') return;
    if (!this.actionType) return;

    this.isSubmitting = true;
    this.disputeService.resolveWeightDispute(this.disputeId, this.actionType)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isSubmitting = false; }))
      .subscribe({
        next: () => {
          alert(`Dispute ${this.actionType!.toLowerCase()} successfully.`);
          this.router.navigate(['/distributor/disputes']);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to resolve dispute.');
        }
      });
  }

  goBack() {
    this.router.navigate(['/distributor/disputes']);
  }
}
