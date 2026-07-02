import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-distributor-dashboard-bottom',
  imports: [CommonModule],
  templateUrl: './distributor-dashboard-bottom.html',
  styleUrl: './distributor-dashboard-bottom.css',
})
export class DistributorDashboardBottom {
  merchantActivity = [
    {
      merchantId: 'MRC-001',
      businessName: 'Fashion Hub',
      action: 'Wallet Top-up',
      amount: 15000,
      date: 'Today, 10:30 AM',
      status: 'Completed'
    },
    {
      merchantId: 'MRC-002',
      businessName: 'Tech Store',
      action: 'Weight Dispute Raised',
      awb: 'AWB123457',
      date: 'Today, 09:15 AM',
      status: 'Open'
    },
    {
      merchantId: 'MRC-003',
      businessName: 'Grocery Mart',
      action: 'New Merchant Onboarded',
      date: 'Yesterday, 04:45 PM',
      status: 'Active'
    }
  ];

  summary = {
    totalMerchants: 12,
    activeMerchants: 10,
    totalRevenue: 145000,
    totalProfit: 12500,
    openDisputes: 3
  };
}