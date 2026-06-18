import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-distributor-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './distributor-dashboard.html',
  styleUrl: './distributor-dashboard.css',
})
export class DistributorDashboard {
  menuItems = [
    { label: 'Dashboard', route: '/distributor/dashboard', icon: 'fa-chart-pie' },
    {
      label: 'Merchants',
      icon: 'fa-store',
      expanded: false,
      children: [
        { label: 'Merchant List', route: '/distributor/merchants' },
        { label: 'Create Merchant', route: '/distributor/merchants/create' }
      ]
    },
    {
      label: 'Operations',
      icon: 'fa-box-open',
      expanded: false,
      children: [
        { label: 'All Shipments', route: '/distributor/operations/shipments' }
      ]
    },
    {
      label: 'Tracking',
      icon: 'fa-map-marked-alt',
      expanded: false,
      children: [
        { label: 'AWB Search', route: '/distributor/tracking/search' },
        { label: 'Live Tracking', route: '/distributor/tracking/live' },
        { label: 'Tracking History', route: '/distributor/tracking/history' }
      ]
    },
    {
      label: 'Merchant Finance',
      icon: 'fa-hand-holding-usd',
      expanded: false,
      children: [
        { label: 'Fund Merchant Wallet', route: '/distributor/merchant-finance/topup' },
        { label: 'Merchant Wallets', route: '/distributor/merchant-finance/wallets' },
        { label: 'Merchant Transactions', route: '/distributor/merchant-finance/transactions' }
      ]
    },
    {
      label: 'My Finance',
      icon: 'fa-wallet',
      expanded: false,
      children: [
        { label: 'My Wallet', route: '/distributor/finance/wallet' },
        { label: 'Transactions', route: '/distributor/finance/transactions' },
        { label: 'Settlements', route: '/distributor/finance/settlements' }
      ]
    },
    {
      label: 'Rate & Margin',
      icon: 'fa-tags',
      expanded: false,
      children: [
        { label: 'Rate Cards', route: '/distributor/rate-margin/rate-cards' },
        { label: 'Margin Configuration', route: '/distributor/rate-margin/margins' },
        { label: 'Profit View', route: '/distributor/rate-margin/profit' }
      ]
    },
    {
      label: 'Weight Disputes',
      icon: 'fa-balance-scale',
      expanded: false,
      children: [
        { label: 'All Disputes', route: '/distributor/disputes' }
      ]
    },
    {
      label: 'Reports & Analytics',
      icon: 'fa-chart-line',
      expanded: false,
      children: [
        { label: 'Merchant Revenue', route: '/distributor/reports/merchant-revenue' },
        { label: 'Profit Analysis', route: '/distributor/reports/profit' },
        { label: 'Shipment Reports', route: '/distributor/reports/shipment-reports' },
        { label: 'Dispute Reports', route: '/distributor/reports/disputes' },
        { label: 'Business Analytics', route: '/distributor/reports/performance-analytics' }
      ]
    },
    {
      label: 'Support Center',
      icon: 'fa-headset',
      expanded: false,
      children: [
        { label: 'Tickets', route: '/distributor/support/tickets' },
        { label: 'Create Ticket', route: '/distributor/support/create-ticket' },
        { label: 'FAQs', route: '/distributor/support/faqs' }
      ]
    },
    {
      label: 'Settings',
      icon: 'fa-cog',
      expanded: false,
      children: [
        { label: 'Profile', route: '/distributor/settings/profile' },
        { label: 'Company Details', route: '/distributor/settings/company-details' },
        { label: 'Notifications', route: '/distributor/settings/notifications' },
        { label: 'Security', route: '/distributor/settings/security' },
        { label: 'API Settings', route: '/distributor/settings/api-settings' }
      ]
    },

  ];
}
