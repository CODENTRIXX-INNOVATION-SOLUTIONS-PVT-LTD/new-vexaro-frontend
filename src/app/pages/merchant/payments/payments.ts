import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MerchantTransaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
}

export interface TopUpRequest {
  id: string;
  date: string;
  amount: number;
  method: string;
  note: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface RefundRecord {
  id: string;
  date: string;
  awb: string;
  reason: string;
  amount: number;
  status: 'Processed' | 'Pending' | 'Rejected';
}

export interface WeightDispute {
  id: string;
  date: string;
  awb: string;
  billedWeight: number;
  actualWeight: number;
  difference: number;
  deduction: number;
  status: 'Applied' | 'Disputed' | 'Resolved';
  contestNote?: string;
  attachments?: string[];
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {
  activeTab: string = 'balance';

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // ─── Balance ──────────────────────────────────────────────────────────────
  balance: number = 12400;
  distributorName: string = 'SpeedX Logistics';

  // Top-up request inline form
  packages = [1000, 2500, 5000, 10000, 25000];
  selectedPackage: number | null = null;
  topUpMethod: string = 'UPI';
  topUpNote: string = '';

  selectPackage(amount: number) {
    this.selectedPackage = amount;
  }

  submitTopUp() {
    if (!this.selectedPackage) {
      alert('Please select an amount to request.');
      return;
    }
    const newReq: TopUpRequest = {
      id: 'REQ' + Math.floor(1000 + Math.random() * 9000),
      date: 'Today',
      amount: this.selectedPackage,
      method: this.topUpMethod,
      note: this.topUpNote || '—',
      status: 'Pending'
    };
    this.topUpRequests.unshift(newReq);
    alert(`Top-up request of ₹${this.selectedPackage.toLocaleString('en-IN')} sent to ${this.distributorName}!`);
    this.selectedPackage = null;
    this.topUpNote = '';
    this.topUpMethod = 'UPI';
    this.activeTab = 'requests';
  }

  get totalSpent(): number {
    return this.transactions.filter(t => t.type === 'debit' && t.status === 'Success')
      .reduce((s, t) => s + t.amount, 0);
  }

  get pendingRequestsCount(): number {
    return this.topUpRequests.filter(r => r.status === 'Pending').length;
  }

  get pendingRefundsCount(): number {
    return this.refunds.filter(r => r.status === 'Pending').length;
  }

  get totalDisputeDeductions(): number {
    return this.disputes.filter(d => d.status === 'Applied')
      .reduce((s, d) => s + d.deduction, 0);
  }

  // ─── Transaction History ──────────────────────────────────────────────────
  transactions: MerchantTransaction[] = [
    { id: 'TXN2001', date: '17 Jun 2026', description: 'Shipment Charge — AWB889012',    type: 'debit',  amount: 320,   status: 'Success', reference: 'AWB889012' },
    { id: 'TXN2002', date: '17 Jun 2026', description: 'Wallet Top-up Approved',          type: 'credit', amount: 10000, status: 'Success', reference: 'REQ1001' },
    { id: 'TXN2003', date: '16 Jun 2026', description: 'Shipment Charge — AWB779234',    type: 'debit',  amount: 180,   status: 'Success', reference: 'AWB779234' },
    { id: 'TXN2004', date: '15 Jun 2026', description: 'Shipment Charge — AWB661122',    type: 'debit',  amount: 450,   status: 'Success', reference: 'AWB661122' },
    { id: 'TXN2005', date: '15 Jun 2026', description: 'Wallet Top-up Approved',          type: 'credit', amount: 5000,  status: 'Success', reference: 'REQ1002' },
    { id: 'TXN2006', date: '14 Jun 2026', description: 'Weight Dispute Deduction',        type: 'debit',  amount: 150,   status: 'Success', reference: 'DIS1001' },
    { id: 'TXN2007', date: '13 Jun 2026', description: 'Shipment Charge — AWB443210',    type: 'debit',  amount: 390,   status: 'Success', reference: 'AWB443210' },
    { id: 'TXN2008', date: '12 Jun 2026', description: 'Refund — AWB334211',             type: 'credit', amount: 320,   status: 'Success', reference: 'RFD001' },
  ];

  // ─── Recharge Requests ────────────────────────────────────────────────────
  topUpRequests: TopUpRequest[] = [
    { id: 'REQ1001', date: '15 Jun 2026', amount: 10000, method: 'UPI',           note: 'Monthly recharge',       status: 'Approved' },
    { id: 'REQ1002', date: '10 Jun 2026', amount: 5000,  method: 'Bank Transfer', note: 'Low balance',            status: 'Approved' },
    { id: 'REQ1003', date: '17 Jun 2026', amount: 25000, method: 'UPI',           note: 'Bulk shipment prepay',   status: 'Pending'  },
  ];

  // ─── Refund History ───────────────────────────────────────────────────────
  refunds: RefundRecord[] = [
    { id: 'RFD001', date: '12 Jun 2026', awb: 'AWB334211', reason: 'Shipment lost in transit',          amount: 320,  status: 'Processed' },
    { id: 'RFD002', date: '09 Jun 2026', awb: 'AWB221983', reason: 'Duplicate charge correction',        amount: 180,  status: 'Processed' },
    { id: 'RFD003', date: '17 Jun 2026', awb: 'AWB889012', reason: 'Delivery failed — merchant request', amount: 320,  status: 'Pending'   },
    { id: 'RFD004', date: '05 Jun 2026', awb: 'AWB112234', reason: 'Wrong item delivered',               amount: 450,  status: 'Rejected'  },
  ];

  // ─── Weight Dispute Deductions ────────────────────────────────────────────
  disputes: WeightDispute[] = [
    { id: 'DIS1001', date: '14 Jun 2026', awb: 'AWB554321', billedWeight: 0.5, actualWeight: 1.2, difference: 0.7, deduction: 150, status: 'Applied'   },
    { id: 'DIS1002', date: '11 Jun 2026', awb: 'AWB443102', billedWeight: 1.0, actualWeight: 2.5, difference: 1.5, deduction: 320, status: 'Applied'   },
    { id: 'DIS1003', date: '17 Jun 2026', awb: 'AWB889012', billedWeight: 0.5, actualWeight: 0.8, difference: 0.3, deduction: 75,  status: 'Disputed'  },
    { id: 'DIS1004', date: '08 Jun 2026', awb: 'AWB223311', billedWeight: 2.0, actualWeight: 2.2, difference: 0.2, deduction: 50,  status: 'Resolved'  },
  ];

  // ─── Contest Dispute Modal ────────────────────────────────────────────────
  showContestModal: boolean = false;
  contestingDispute: WeightDispute | null = null;
  contestNote: string = '';
  selectedFileNames: string[] = [];

  openContest(dispute: WeightDispute) {
    this.contestingDispute = dispute;
    this.contestNote = '';
    this.selectedFileNames = [];
    this.showContestModal = true;
  }

  closeContest() {
    this.showContestModal = false;
    this.contestingDispute = null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFileNames = Array.from(input.files).map(f => f.name);
    }
  }

  submitContest() {
    if (!this.contestNote.trim()) {
      alert('Please describe why you believe this deduction is incorrect.');
      return;
    }
    if (this.contestingDispute) {
      this.contestingDispute.status = 'Disputed';
      this.contestingDispute.contestNote = this.contestNote;
      this.contestingDispute.attachments = [...this.selectedFileNames];
    }
    alert('Your dispute has been submitted to the distributor. They will review and respond shortly.');
    this.closeContest();
  }
}
