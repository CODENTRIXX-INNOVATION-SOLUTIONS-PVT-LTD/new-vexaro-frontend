import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FinanceService } from '../../../../services/finance.service';
import { 
  RefundRequest, 
  RefundRequestStatus,
  RefundRequestParams 
} from '../../../../models/refund-request.model';

@Component({
  selector: 'app-refund-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './refund-requests.html',
  styleUrl: './refund-requests.css'
})
export class RefundRequests implements OnInit, OnDestroy {
  // State
  requests: RefundRequest[] = [];
  filteredRequests: RefundRequest[] = [];
  isLoading: boolean = false;
  isProcessing: boolean = false;
  errorMessage: string = '';
  
  // Filters
  statusFilter: RefundRequestStatus | 'All' = 'All';
  searchTerm: string = '';
  
  // Modal state
  selectedRequest: RefundRequest | null = null;
  rejectionReason: string = '';
  showRejectModal: boolean = false;
  
  // RxJS cleanup
  private destroy$ = new Subject<void>();

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params: RefundRequestParams = {
      status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      limit: 50
    };

    this.financeService.getRefundRequests(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.requests) {
            this.requests = response.data.requests;
            this.applyFilters();
          } else {
            this.errorMessage = response.message || 'Failed to load requests';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading refund requests:', error);
          this.errorMessage = error.message || 'Failed to load refund requests. Please try again.';
          this.isLoading = false;
          
          if (error.message.includes('Session expired')) {
            window.location.href = '/login';
          }
        }
      });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(req => {
      const matchesStatus = this.statusFilter === 'All' || req.status === this.statusFilter;
      const matchesSearch = !this.searchTerm || 
        req.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        req.awb.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  approveRequest(request: RefundRequest): void {
    const confirmationMessage = `Are you sure you want to approve the refund request of ₹${request.amount.toLocaleString('en-IN')} from ${request.merchantName}?`;
    if (!confirm(confirmationMessage)) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    this.financeService.processRefundRequest(request.id, { action: 'approve' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            alert('Refund request approved successfully!');
            this.loadRequests();
          } else {
            this.errorMessage = response.message || 'Failed to approve request. Please try again.';
          }
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Error approving request:', error);
          this.errorMessage = error.message || 'Failed to approve request. Please try again.';
        }
      });
  }

  openRejectModal(request: RefundRequest): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
    this.errorMessage = '';
  }

  closeRejectModal(): void {
    this.selectedRequest = null;
    this.rejectionReason = '';
    this.showRejectModal = false;
    this.errorMessage = '';
  }

  rejectRequest(): void {
    if (!this.selectedRequest) {
      this.errorMessage = 'No request selected';
      return;
    }
    
    if (!this.rejectionReason.trim()) {
      this.errorMessage = 'Please provide a reason for rejection.';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    this.financeService.processRefundRequest(this.selectedRequest.id, { 
      action: 'reject', 
      reason: this.rejectionReason 
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          alert('Refund request rejected successfully!');
          this.closeRejectModal();
          this.loadRequests();
        } else {
          this.errorMessage = response.message || 'Failed to reject request. Please try again.';
        }
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error rejecting request:', error);
        this.errorMessage = error.message || 'Failed to reject request. Please try again.';
      }
    });
  }

  onFilterChange(): void {
    this.loadRequests();
  }

  onSearchChange(): void {
    this.applyFilters();
  }
}
