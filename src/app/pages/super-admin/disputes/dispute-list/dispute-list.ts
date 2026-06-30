import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface GlobalDispute {
  id: string;
  date: string;
  awb: string;
  merchantName: string;
  distributorName: string;
  declaredWeight: number;
  actualWeight: number;
  difference: number;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  proofUrl?: string;
}

@Component({
  selector: 'app-admin-dispute-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-list.html',
  styleUrl: './dispute-list.css'
})
export class AdminDisputeList {
  statusFilter: string = 'All';
  distributorFilter: string = 'All';
  dateFilter: string = 'Any';

  disputes: GlobalDispute[] = [
    { id: 'DSP-8821', date: '16 Jun 2026', awb: 'AWB990123', merchantName: 'Fashion Hub', distributorName: 'SpeedX Logistics', declaredWeight: 0.5, actualWeight: 1.2, difference: 0.7, amount: 150, status: 'Pending', proofUrl: 'proof1.jpg' },
    { id: 'DSP-8822', date: '15 Jun 2026', awb: 'AWB771234', merchantName: 'Tech Store', distributorName: 'FastTrack Couriers', declaredWeight: 1.0, actualWeight: 2.5, difference: 1.5, amount: 320, status: 'Pending', proofUrl: 'proof2.jpg' },
    { id: 'DSP-8823', date: '14 Jun 2026', awb: 'AWB662345', merchantName: 'Home Goods', distributorName: 'SpeedX Logistics', declaredWeight: 2.0, actualWeight: 2.1, difference: 0.1, amount: 50, status: 'Approved' },
    { id: 'DSP-8824', date: '12 Jun 2026', awb: 'AWB553456', merchantName: 'Beauty Co', distributorName: 'Global Transit', declaredWeight: 0.5, actualWeight: 1.5, difference: 1.0, amount: 200, status: 'Rejected' },
  ];

  constructor(private router: Router) { }

  isProofModalOpen: boolean = false;
  currentProofUrl: string = '';
  currentProofAwb: string = '';

  approveDispute(dispute: GlobalDispute) {
    if (confirm(`Approve dispute for AWB ${dispute.awb}? This will reverse the deduction charge.`)) {
      dispute.status = 'Approved';
    }
  }

  rejectDispute(dispute: GlobalDispute) {
    if (confirm(`Reject dispute for AWB ${dispute.awb}? This will permanently close the dispute.`)) {
      dispute.status = 'Rejected';
    }
  }

  viewProof(dispute: GlobalDispute) {
    if (dispute.proofUrl) {
      this.currentProofUrl = dispute.proofUrl;
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
