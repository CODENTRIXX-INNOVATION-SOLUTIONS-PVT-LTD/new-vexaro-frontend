import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../services/user.service';
import { 
  WarehouseChangeRequest, 
  WarehouseRequestStatus,
  WarehouseChangeRequestParams 
} from '../../../../models/warehouse-change-request.model';

@Component({
  selector: 'app-warehouse-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-requests.html',
  styleUrl: './warehouse-requests.css'
})
export class WarehouseRequests implements OnInit, OnDestroy {
  // State
  requests: WarehouseChangeRequest[] = [];
  filteredRequests: WarehouseChangeRequest[] = [];
  isLoading: boolean = false;
  isProcessing: boolean = false;
  errorMessage: string = '';
  
  // Filters
  statusFilter: WarehouseRequestStatus | 'All' = 'All';
  searchTerm: string = '';
  
  // Modal state
  selectedRequest: WarehouseChangeRequest | null = null;
  rejectionReason: string = '';
  showRejectModal: boolean = false;
  
  // RxJS cleanup
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load warehouse change requests from API
   */
  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params: WarehouseChangeRequestParams = {
      status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      limit: 50
    };

    this.userService.getWarehouseChangeRequests(params)
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
          console.error('Error loading warehouse change requests:', error);
          this.errorMessage = error.message || 'Failed to load warehouse requests. Please try again.';
          this.isLoading = false;
          
          if (error.message.includes('Session expired')) {
            window.location.href = '/login';
          }
        }
      });
  }

  /**
   * Apply client-side filters
   */
  applyFilters(): void {
    this.filteredRequests = this.requests.filter(req => {
      const matchesStatus = this.statusFilter === 'All' || req.status === this.statusFilter;
      const matchesSearch = !this.searchTerm || 
        req.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        req.merchantEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  /**
   * Approve a warehouse change request
   * @param request The request to approve
   */
  approveRequest(request: WarehouseChangeRequest): void {
    const confirmationMessage = `Are you sure you want to approve the warehouse change request from ${request.merchantName}?`;
    if (!confirm(confirmationMessage)) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    this.userService.approveWarehouseChangeRequest(request.id, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            alert('Warehouse change request approved successfully!');
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

  /**
   * Open rejection modal
   * @param request The request to reject
   */
  openRejectModal(request: WarehouseChangeRequest): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
    this.errorMessage = '';
  }

  /**
   * Close rejection modal
   */
  closeRejectModal(): void {
    this.selectedRequest = null;
    this.rejectionReason = '';
    this.showRejectModal = false;
    this.errorMessage = '';
  }

  /**
   * Reject a warehouse change request
   */
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

    this.userService.rejectWarehouseChangeRequest(this.selectedRequest.id, { reason: this.rejectionReason })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            alert('Warehouse change request rejected successfully!');
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

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.loadRequests();
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.applyFilters();
  }
}
