import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DisputeService } from '../../../../services/dispute.service';

export interface GlobalDispute {
  id: string;
  createdAt: string;
  awb: string;
  category: string;
  description: string;
  raisedBy: string;
  assignedTo?: string;
  status: string;
  attachments: { url: string; name: string }[];
}

@Component({
  selector: 'app-admin-dispute-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-list.html',
  styleUrl: './dispute-list.css'
})
export class AdminDisputeList implements OnInit {
  statusFilter: string = 'All';
  distributorFilter: string = 'All';
  dateFilter: string = 'Any';

  disputes: GlobalDispute[] = [];
  isLoading = false;
  errorMessage = '';
  isProofModalOpen = false;
  currentProofUrl = '';
  currentProofAwb = '';

  constructor(private router: Router, private disputeService: DisputeService) { }

  ngOnInit() {
    this.loadDisputes();
  }

  private normalizeDispute(dispute: any): GlobalDispute {
    return {
      id: dispute._id,
      createdAt: dispute.createdAt
        ? new Date(dispute.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '',
      awb: dispute.shipmentId?.awb ?? 'N/A',
      category: dispute.category ?? 'Unknown',
      description: dispute.description ?? '',
      raisedBy: dispute.raisedBy ? `${dispute.raisedBy.firstName} ${dispute.raisedBy.lastName}` : 'Unknown',
      assignedTo: dispute.assignedTo ? `${dispute.assignedTo.firstName} ${dispute.assignedTo.lastName}` : 'Unassigned',
      status: dispute.status,
      attachments: Array.isArray(dispute.attachments) ? dispute.attachments : [],
    };
  }

  loadDisputes() {
    this.isLoading = true;
    this.errorMessage = '';
    this.disputeService.listDisputes().subscribe({
      next: (res) => {
        const disputes = res?.data?.disputes ?? [];
        this.disputes = disputes.map((d: any) => this.normalizeDispute(d));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Unable to load disputes.';
      },
    });
  }

  approveDispute(dispute: GlobalDispute) {
    if (confirm(`Approve dispute for AWB ${dispute.awb}? This will resolve the dispute.`)) {
      this.disputeService.resolveWeightDispute(dispute.id, 'RESOLVED').subscribe({
        next: () => dispute.status = 'RESOLVED',
        error: () => alert('Failed to approve dispute.'),
      });
    }
  }

  rejectDispute(dispute: GlobalDispute) {
    if (confirm(`Reject dispute for AWB ${dispute.awb}? This will close the dispute.`)) {
      this.disputeService.resolveWeightDispute(dispute.id, 'CLOSED').subscribe({
        next: () => dispute.status = 'CLOSED',
        error: () => alert('Failed to reject dispute.'),
      });
    }
  }

  viewProof(dispute: GlobalDispute) {
    const proof = dispute.attachments?.[0];
    if (proof?.url) {
      this.currentProofUrl = proof.url;
      this.currentProofAwb = dispute.awb;
      this.isProofModalOpen = true;
    } else {
      alert('No proof document attached.');
    }
  }

  closeProofModal() {
    this.isProofModalOpen = false;
    this.currentProofUrl = '';
    this.currentProofAwb = '';
  }
}
