import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialStore, RechargeRequest } from '../../../shared/financial-store';

@Component({
  selector: 'app-distributor-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class DistributorWallet implements OnInit {
  balance: number = 28500;
  
  packages = [5000, 10000, 25000, 50000];
  selectedPackage: number | null = null;
  paymentMethod: string = 'UPI';
  referenceId: string = '';
  
  myRequests: RechargeRequest[] = [];

  ngOnInit() {
    this.loadMyRequests();
  }

  loadMyRequests() {
    // Distributor ID is simulated as 2 (Rapid Delivery Services)
    this.myRequests = FinancialStore.requests.filter(r => r.distributorId === 2);
    
    // Calculate balance from base 3500 + approved requests
    const approvedTotal = this.myRequests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.amount, 0);
    this.balance = 3500 + approvedTotal;
  }

  selectPackage(amount: number) {
    this.selectedPackage = amount;
  }

  submitRequest() {
    if (!this.selectedPackage) {
      alert('Please select a recharge package.');
      return;
    }

    const newReq: RechargeRequest = {
      requestId: 'REQ' + Math.floor(1000 + Math.random() * 9000),
      distributorId: 2,
      distributorName: 'Rapid Delivery Services',
      date: '17 Jun 2026',
      amount: this.selectedPackage,
      method: this.paymentMethod,
      status: 'Pending',
      reference: this.referenceId || 'N/A'
    };

    FinancialStore.requests.unshift(newReq);
    this.loadMyRequests();
    
    alert(`Recharge request for ₹${this.selectedPackage} submitted successfully!`);
    
    // Reset Form
    this.selectedPackage = null;
    this.referenceId = '';
  }
}
