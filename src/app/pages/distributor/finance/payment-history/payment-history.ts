import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FinanceService } from '../../../../services/finance.service';
import { 
  Payment, 
  PaymentStatus,
  PaymentParams 
} from '../../../../models/payment.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.css'
})
export class PaymentHistory implements OnInit, OnDestroy {
  // State
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Filters
  statusFilter: PaymentStatus | 'All' = 'All';
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';
  
  // Modal state
  selectedPayment: Payment | null = null;
  showDetailModal: boolean = false;
  
  // RxJS cleanup
  private destroy$ = new Subject<void>();

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params: PaymentParams = {
      status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      limit: 50
    };

    this.financeService.getPayments(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.payments) {
            this.payments = response.data.payments;
            this.applyFilters();
          } else {
            this.errorMessage = response.message || 'Failed to load payment history';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payment history:', error);
          this.errorMessage = error.message || 'Failed to load payment history. Please try again.';
          this.isLoading = false;
          
          if (error.message.includes('Session expired')) {
            window.location.href = '/login';
          }
        }
      });
  }

  applyFilters(): void {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = !this.searchTerm || 
        payment.razorpayPaymentId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  viewDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.selectedPayment = null;
    this.showDetailModal = false;
  }

  onFilterChange(): void {
    this.loadPayments();
  }

  onSearchChange(): void {
    this.applyFilters();
  }
}
