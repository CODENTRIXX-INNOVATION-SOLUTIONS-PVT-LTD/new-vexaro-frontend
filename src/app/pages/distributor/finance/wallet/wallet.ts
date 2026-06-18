import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {
  balance: number = 0;
  lockedFunds: number = 0;
  transactions: any[] = [];
  isLoading: boolean = false;
  isTopupModalOpen: boolean = false;
  topupAmount: number = 0;
  topupReference: string = '';

  ngOnInit() {
    this.loadWalletData();
  }

  loadWalletData() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/wallet
    this.isLoading = false;
  }

  openTopupModal() {
    this.isTopupModalOpen = true;
    this.topupAmount = 0;
    this.topupReference = '';
  }

  closeTopupModal() {
    this.isTopupModalOpen = false;
  }

  submitTopupRequest() {
    if (this.topupAmount <= 0 || !this.topupReference) return;
    // TODO: POST /distributor/:id/wallet/topup-request
    console.log(`Requested topup of ₹${this.topupAmount} with ref: ${this.topupReference}`);
    this.closeTopupModal();
    // Show success message
  }
}
