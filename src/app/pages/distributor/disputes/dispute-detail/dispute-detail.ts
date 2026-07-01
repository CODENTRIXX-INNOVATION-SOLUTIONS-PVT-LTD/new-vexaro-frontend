import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DisputeService } from '../../../../services/dispute.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-dispute-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-detail.html',
  styleUrl: './dispute-detail.css'
})
export class DisputeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private disputeService = inject(DisputeService);
  private authService = inject(AuthService);

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
    comments: [],
    proofImages: []
  };

  remarks: string = '';
  actionType: 'APPROVED' | 'REJECTED' | null = null;
  uploadedFiles: File[] = [];

  ngOnInit() {
    this.disputeId = this.route.snapshot.paramMap.get('id') || '';
    this.authService.getMe().subscribe({
      next: (user) => {
        this.userRole = user.role;
      },
      error: (err) => console.error('Failed to load user profile:', err)
    });
    this.loadDisputeDetails();
  }

  loadDisputeDetails() {
    this.isLoading = true;
    this.disputeService.getDisputeById(this.disputeId).subscribe({
      next: (res) => {
        this.isLoading = false;
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
            deadlineDate: new Date(d.disputeExpiresAt).toLocaleDateString('en-IN'),
            hoursLeft: Math.max(0, Math.ceil((new Date(d.disputeExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60))),
            productName: d.description || '—',
            boxDimensions: '—',
            comments: d.comments || [],
            proofImages: d.proofImages || []
          };
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load dispute details:', err);
      }
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  submitAction() {
    this.isSubmitting = true;
    if (this.userRole === 'SUPER_ADMIN') {
      const action = this.actionType;
      if (!action) return;
      this.disputeService.resolveWeightDispute(this.disputeId, action).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert(`Dispute ${action.toLowerCase()} successfully.`);
          this.router.navigate(['/distributor/disputes']);
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(err.error?.message || 'Failed to resolve dispute.');
        }
      });
    } else {
      if (!this.remarks.trim()) {
        alert('Please enter your comment.');
        this.isSubmitting = false;
        return;
      }
      this.disputeService.addComment(this.disputeId, this.remarks).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Comment added successfully.');
          this.remarks = '';
          this.loadDisputeDetails();
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(err.error?.message || 'Failed to add comment.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/distributor/disputes']);
  }
}
