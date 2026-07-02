import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-distributor-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class DistributorWallet implements OnInit {
  balance: number = 0;
  isLoading: boolean = false;
  isProcessingPayment: boolean = false;
  
  packages = [5000, 10000, 25000, 50000];
  selectedPackage: number | null = null;
  paymentMethod: string = 'UPI';
  referenceId: string = '';

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadWallet();
  }

  loadWallet() {
    this.isLoading = true;
    this.financeService.getMyWallet().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.balance = response.data.balance || 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.isLoading = false;
      }
    });
  }

  selectPackage(amount: number) {
    this.selectedPackage = amount;
  }

  submitRequest() {
    if (!this.selectedPackage) {
      alert('Please select a recharge package.');
      return;
    }

    this.isProcessingPayment = true;
    this.financeService.createRazorpayOrder(this.selectedPackage).subscribe({
      next: (response: any) => {
        this.isProcessingPayment = false;
        if (response.success && response.data) {
          this.initiateRazorpayPayment(response.data);
        } else {
          alert('Failed to create payment order. Please try again.');
        }
      },
      error: (error: any) => {
        this.isProcessingPayment = false;
        alert(error.error?.message || 'Failed to create payment order. Please try again.');
      }
    });
  }

  private initiateRazorpayPayment(orderData: any) {
    // Note: This requires Razorpay SDK to be loaded
    // For now, we'll simulate the payment flow
    // In production, integrate with actual Razorpay checkout
    const options = {
      key: orderData.key || 'rzp_test_placeholder',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Vexaro Courier',
      description: 'Wallet Recharge',
      order_id: orderData.orderId,
      handler: (response: any) => {
        this.verifyPayment(response);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#0b4a6f'
      }
    };

    // Check if Razorpay is available
    if (typeof (window as any).Razorpay !== 'undefined') {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert('Payment gateway not loaded. Please refresh the page.');
    }
  }

  private verifyPayment(paymentResponse: any) {
    this.isProcessingPayment = true;
    this.financeService.verifyPayment({
      paymentId: paymentResponse.razorpay_payment_id,
      orderId: paymentResponse.razorpay_order_id,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      signature: paymentResponse.razorpay_signature
    }).subscribe({
      next: (response: any) => {
        this.isProcessingPayment = false;
        if (response.success) {
          alert('Wallet recharge successful!');
          this.loadWallet();
          this.selectedPackage = null;
          this.referenceId = '';
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      error: (error: any) => {
        this.isProcessingPayment = false;
        alert(error.error?.message || 'Payment verification failed. Please contact support.');
      }
    });
  }
}
