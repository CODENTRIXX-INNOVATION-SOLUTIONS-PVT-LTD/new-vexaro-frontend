import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';
import { DisputeService } from '../../../services/dispute.service';

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
  status: string;
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
export class Payments implements OnInit {
  private financeService = inject(FinanceService);
  private disputeService = inject(DisputeService);

  activeTab: string = 'balance';

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // Wallet
  balance: number = 0;
  codEscrowBalance: number = 0;
  distributorName: string = 'Vexaro Network';

  // Top-up request inline form
  packages = [1000, 2500, 5000, 10000, 25000];
  selectedPackage: number | null = null;
  topUpMethod: 'checkout' | 'upi_qr' = 'checkout';
  topUpNote: string = '';
  isPaymentProcessing: boolean = false;

  transactions: MerchantTransaction[] = [];
  topUpRequests: TopUpRequest[] = [];
  refunds: RefundRecord[] = [];
  disputes: WeightDispute[] = [];

  // Contest Dispute Modal
  showContestModal: boolean = false;
  contestingDispute: WeightDispute | null = null;
  contestNote: string = '';
  selectedFileNames: string[] = [];

  ngOnInit(): void {
    this.loadWalletDetails();
    this.loadTransactions();
    this.loadDisputes();
  }

  loadWalletDetails(): void {
    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        if (res.data) {
          this.balance = res.data.balance;
          this.codEscrowBalance = res.data.codEscrowBalance || 0;
        }
      },
      error: (err) => console.error('Failed to load wallet:', err)
    });
  }

  loadTransactions(): void {
    this.financeService.listTransactions({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.data && res.data.transactions) {
          this.transactions = res.data.transactions.map((t: any) => ({
            id: t._id,
            date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            description: t.note || t.type,
            type: t.amount >= 0 ? 'credit' : 'debit',
            amount: Math.abs(t.amount),
            status: 'Success',
            reference: t.reference || '—',
          }));
        }
      },
      error: (err) => console.error('Failed to load transactions:', err)
    });
  }

  loadDisputes(): void {
    this.disputeService.listDisputes({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.data && res.data.items) {
          this.disputes = res.data.items.map((d: any) => ({
            id: d._id,
            date: new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            awb: d.shipmentId?.awb || '—',
            billedWeight: d.billedWeight || 0,
            actualWeight: d.actualWeight || 0,
            difference: Math.max(0, (d.actualWeight || 0) - (d.billedWeight || 0)),
            deduction: d.extraCharge || 0,
            status: d.status,
            contestNote: d.description || '',
            attachments: (d.proofImages || []).map((img: string) => img.split('/').pop()),
          }));
        }
      },
      error: (err) => console.error('Failed to load disputes:', err)
    });
  }

  selectPackage(amount: number) {
    this.selectedPackage = amount;
  }

  async submitTopUp() {
    if (!this.selectedPackage) {
      alert('Please select an amount to add.');
      return;
    }

    this.isPaymentProcessing = true;
    try {
      await this.financeService.startRazorpayWalletTopup(this.selectedPackage, this.topUpMethod);
      alert('Payment verified and wallet credited.');
      this.selectedPackage = null;
      this.loadWalletDetails();
      this.loadTransactions();
    } catch (err: any) {
      alert(err?.error?.message || err?.message || 'Payment could not be completed.');
    } finally {
      this.isPaymentProcessing = false;
    }
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
      const mockImageUrls = this.selectedFileNames.map(f => `/uploads/proofs/${f}`);
      this.disputeService.submitProof(this.contestingDispute.id, mockImageUrls).subscribe({
        next: (updated) => {
          alert('Dispute proof submitted successfully!');
          this.loadDisputes();
          this.closeContest();
        },
        error: (err) => alert(err.error?.message || 'Failed to submit proof.')
      });
    }
  }
}
