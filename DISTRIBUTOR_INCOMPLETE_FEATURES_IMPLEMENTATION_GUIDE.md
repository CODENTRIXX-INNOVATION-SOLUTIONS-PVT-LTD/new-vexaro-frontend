# Distributor Module - Incomplete Features Implementation Guide

This document provides detailed implementation guidance for incomplete Distributor module features, following enterprise-grade best practices with comprehensive exception handling, proper TypeScript typing, RxJS patterns, and production-ready code.

---

## Table of Contents
1. [Warehouse Change Request Approval](#1-warehouse-change-request-approval)
2. [Refund Request Management](#2-refund-request-management)
3. [Payment History Page](#3-payment-history-page)
4. [Reports (COD, Wallet, Payment)](#4-reports-cod-wallet-payment)
5. [Async Export Jobs](#5-async-export-jobs)
6. [Bulk Upload Status Polling](#6-bulk-upload-status-polling)
7. [Dispute Comment Endpoint](#7-dispute-comment-endpoint)
8. [Common Patterns & Utilities](#8-common-patterns--utilities)

---

## 1. Warehouse Change Request Approval

**Status:** Backend exists, no Distributor UI page

### Backend Endpoints (Already Exist)
```
GET /api/users/distributor/warehouse-change-requests
POST /api/users/distributor/warehouse-change-requests/:requestId/approve
POST /api/users/distributor/warehouse-change-requests/:requestId/reject
```

### Implementation Plan

#### Step 1: Define TypeScript Interfaces

**File:** `src/app/models/warehouse-change-request.model.ts`

```typescript
export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type WarehouseRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WarehouseChangeRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  warehouseId: string;
  currentAddress: Address;
  newAddress: Address;
  status: WarehouseRequestStatus;
  submittedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface WarehouseChangeRequestParams {
  status?: WarehouseRequestStatus;
  page?: number;
  limit?: number;
}

export interface WarehouseChangeRequestResponse {
  success: boolean;
  data: {
    requests: WarehouseChangeRequest[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface WarehouseActionResponse {
  success: boolean;
  data: WarehouseChangeRequest;
  message: string;
}
```

#### Step 2: Add Service Methods to UserService

**File:** `src/app/services/user.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { 
  WarehouseChangeRequest, 
  WarehouseChangeRequestParams, 
  WarehouseChangeRequestResponse,
  WarehouseActionResponse 
} from '../models/warehouse-change-request.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = '/api';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  /**
   * Fetch warehouse change requests with optional filtering
   * @param params Query parameters for filtering and pagination
   * @returns Observable of warehouse change requests
   */
  getWarehouseChangeRequests(params: WarehouseChangeRequestParams = {}): Observable<WarehouseChangeRequestResponse> {
    let httpParams = new HttpParams();
    
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<WarehouseChangeRequestResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests`,
      { params: httpParams, ...this.httpOptions }
    ).pipe(
      retry(1), // Retry once on network errors
      catchError(this.handleError<WarehouseChangeRequestResponse>('getWarehouseChangeRequests'))
    );
  }

  /**
   * Approve a warehouse change request
   * @param requestId The ID of the request to approve
   * @param payload Optional payload for approval
   * @returns Observable of approval response
   */
  approveWarehouseChangeRequest(
    requestId: string, 
    payload: Record<string, any> = {}
  ): Observable<WarehouseActionResponse> {
    if (!requestId || requestId.trim() === '') {
      return throwError(() => new Error('Request ID is required'));
    }

    return this.http.post<WarehouseActionResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests/${requestId}/approve`,
      payload,
      this.httpOptions
    ).pipe(
      catchError(this.handleError<WarehouseActionResponse>('approveWarehouseChangeRequest'))
    );
  }

  /**
   * Reject a warehouse change request
   * @param requestId The ID of the request to reject
   * @param payload Payload containing rejection reason
   * @returns Observable of rejection response
   */
  rejectWarehouseChangeRequest(
    requestId: string, 
    payload: { reason: string }
  ): Observable<WarehouseActionResponse> {
    if (!requestId || requestId.trim() === '') {
      return throwError(() => new Error('Request ID is required'));
    }
    
    if (!payload.reason || payload.reason.trim() === '') {
      return throwError(() => new Error('Rejection reason is required'));
    }

    return this.http.post<WarehouseActionResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests/${requestId}/reject`,
      payload,
      this.httpOptions
    ).pipe(
      catchError(this.handleError<WarehouseActionResponse>('rejectWarehouseChangeRequest'))
    );
  }

  /**
   * Generic error handler for HTTP requests
   * @param operation Name of the operation that failed
   * @returns Error handler function
   */
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Handle specific HTTP status codes
      if (error.status === 401) {
        return throwError(() => new Error('Session expired. Please login again.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('You do not have permission to perform this action.'));
      }
      if (error.status === 404) {
        return throwError(() => new Error('Resource not found.'));
      }
      if (error.status === 409) {
        return throwError(() => new Error('This request has already been processed.'));
      }
      if (error.status === 422) {
        return throwError(() => new Error(error.error?.message || 'Validation error.'));
      }
      if (error.status >= 500) {
        return throwError(() => new Error('Server error. Please try again later.'));
      }

      // Return error message from backend if available
      const errorMessage = error.error?.message || error.message || 'An unexpected error occurred.';
      return throwError(() => new Error(errorMessage));
    };
  }
}
```

#### Step 3: Create Warehouse Requests Component

**File:** `src/app/pages/distributor/merchants/warehouse-requests/warehouse-requests.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
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
          
          // Handle session expiration
          if (error.message.includes('Session expired')) {
            // Redirect to login or trigger auth refresh
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
            // Show success notification (use toast/snackbar in production)
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
   * Handle search input (debounced in production)
   */
  onSearchChange(): void {
    this.applyFilters();
  }
}
```

#### Step 4: Create Template

**File:** `src/app/pages/distributor/merchants/warehouse-requests/warehouse-requests.html`

```html
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">Warehouse Change Requests</h1>
  </div>

  <!-- Error Message -->
  @if (errorMessage) {
    <div class="error-banner" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
      <button class="btn-close-error" (click)="errorMessage = ''" aria-label="Close error">×</button>
    </div>
  }

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="statusFilter">Status:</label>
      <select id="statusFilter" [(ngModel)]="statusFilter" (change)="onFilterChange()">
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="searchTerm">Search:</label>
      <input 
        type="text" 
        id="searchTerm"
        [(ngModel)]="searchTerm" 
        (input)="onSearchChange()" 
        placeholder="Merchant name or email"
        aria-label="Search requests"
      >
    </div>
  </div>

  <!-- Loading State -->
  @if (isLoading) {
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Loading requests...</p>
    </div>
  }

  <!-- Empty State -->
  @if (!isLoading && filteredRequests.length === 0) {
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
      <p>No warehouse change requests found.</p>
    </div>
  }

  <!-- Requests Grid -->
  @if (!isLoading && filteredRequests.length > 0) {
    <div class="requests-grid">
      @for (request of filteredRequests; track request.id) {
        <div class="request-card">
          <div class="request-header">
            <h3>{{ request.merchantName }}</h3>
            <span class="status-badge" 
                  [class.pending]="request.status === 'Pending'" 
                  [class.approved]="request.status === 'Approved'" 
                  [class.rejected]="request.status === 'Rejected'"
                  role="status">
              {{ request.status }}
            </span>
          </div>
          
          <div class="request-details">
            <div class="detail-row">
              <span>Email:</span>
              <strong>{{ request.merchantEmail }}</strong>
            </div>
            <div class="detail-row">
              <span>Submitted:</span>
              <strong>{{ request.submittedAt | date:'medium' }}</strong>
            </div>
          </div>

          <div class="address-comparison">
            <div class="address-box current">
              <h4>Current Address</h4>
              <p>{{ request.currentAddress.addressLine1 }}</p>
              @if (request.currentAddress.addressLine2) {
                <p>{{ request.currentAddress.addressLine2 }}</p>
              }
              <p>{{ request.currentAddress.city }}, {{ request.currentAddress.state }} - {{ request.currentAddress.pincode }}</p>
            </div>
            <div class="arrow" aria-hidden="true">→</div>
            <div class="address-box new">
              <h4>New Address</h4>
              <p>{{ request.newAddress.addressLine1 }}</p>
              @if (request.newAddress.addressLine2) {
                <p>{{ request.newAddress.addressLine2 }}</p>
              }
              <p>{{ request.newAddress.city }}, {{ request.newAddress.state }} - {{ request.newAddress.pincode }}</p>
            </div>
          </div>

          @if (request.status === 'Pending') {
            <div class="request-actions">
              <button 
                class="btn-approve" 
                (click)="approveRequest(request)" 
                [disabled]="isProcessing"
                aria-label="Approve request from {{ request.merchantName }}">
                Approve
              </button>
              <button 
                class="btn-reject" 
                (click)="openRejectModal(request)" 
                [disabled]="isProcessing"
                aria-label="Reject request from {{ request.merchantName }}">
                Reject
              </button>
            </div>
          }

          @if (request.status === 'Rejected' && request.rejectionReason) {
            <div class="rejection-reason" role="alert">
              <strong>Rejection Reason:</strong> {{ request.rejectionReason }}
            </div>
          }
        </div>
      }
    </div>
  }
</div>

<!-- Reject Modal -->
@if (showRejectModal) {
  <div class="modal-overlay" (click)="closeRejectModal()" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <h2 id="reject-modal-title">Reject Warehouse Change Request</h2>
      <p>Merchant: <strong>{{ selectedRequest?.merchantName }}</strong></p>
      
      @if (errorMessage) {
        <div class="error-message" role="alert">{{ errorMessage }}</div>
      }
      
      <div class="form-group">
        <label for="rejectionReason">Rejection Reason <span aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
        <textarea 
          id="rejectionReason"
          [(ngModel)]="rejectionReason" 
          rows="4" 
          placeholder="Enter reason for rejection..."
          [attr.aria-invalid]="errorMessage ? 'true' : 'false'"
          [attr.aria-describedby]="errorMessage ? 'rejection-error' : null"
        ></textarea>
        @if (errorMessage) {
          <span id="rejection-error" class="error-text">{{ errorMessage }}</span>
        }
      </div>
      
      <div class="modal-actions">
        <button class="btn-cancel" (click)="closeRejectModal()">Cancel</button>
        <button 
          class="btn-reject" 
          (click)="rejectRequest()" 
          [disabled]="isProcessing || !rejectionReason.trim()">
          Reject Request
        </button>
      </div>
    </div>
  </div>
}
```

#### Step 5: Add Routing

**File:** `src/app/app.routes.ts` (or equivalent routing file)

```typescript
{
  path: 'distributor/merchants/warehouse-requests',
  loadComponent: () => import('./pages/distributor/merchants/warehouse-requests/warehouse-requests.ts').then(m => m.WarehouseRequests),
  canActivate: [AuthGuard],
  data: { title: 'Warehouse Change Requests' }
}
```

### Best Practices Applied
- ✅ Strong TypeScript typing with interfaces and type aliases
- ✅ RxJS operators with proper cleanup using Subject
- ✅ Comprehensive error handling with specific status code handling
- ✅ Input validation before API calls
- ✅ Loading and processing states
- ✅ User confirmation before destructive actions
- ✅ Form validation with error messages
- ✅ Accessibility features (ARIA labels, roles, live regions)
- ✅ Filtering and search functionality
- ✅ Modal for rejection with reason input
- ✅ Reactive data updates after successful operations
- ✅ Component lifecycle management (ngOnDestroy)
- ✅ Session expiration handling

---

## 2. Refund Request Management

**Status:** Backend exists, no Distributor UI page

### Backend Endpoints (Already Exist)
```
POST /api/finance/refund-requests
GET /api/finance/refund-requests
PATCH /api/finance/refund-requests/:id/process
```

### Implementation Plan

#### Step 1: Define TypeScript Interfaces

**File:** `src/app/models/refund-request.model.ts`

```typescript
export type RefundRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RefundRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  shipmentId: string;
  awb: string;
  amount: number;
  reason: string;
  status: RefundRequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface RefundRequestParams {
  status?: RefundRequestStatus;
  merchantId?: string;
  page?: number;
  limit?: number;
}

export interface RefundRequestResponse {
  success: boolean;
  data: {
    requests: RefundRequest[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface RefundActionPayload {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface RefundActionResponse {
  success: boolean;
  data: RefundRequest;
  message: string;
}
```

#### Step 2: Add Service Methods to FinanceService

**File:** `src/app/services/finance.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { 
  RefundRequest, 
  RefundRequestParams, 
  RefundRequestResponse,
  RefundActionPayload,
  RefundActionResponse 
} from '../models/refund-request.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private baseUrl = '/api/finance';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  /**
   * Fetch refund requests with optional filtering
   * @param params Query parameters for filtering and pagination
   * @returns Observable of refund requests
   */
  getRefundRequests(params: RefundRequestParams = {}): Observable<RefundRequestResponse> {
    let httpParams = new HttpParams();
    
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<RefundRequestResponse>(
      `${this.baseUrl}/refund-requests`,
      { params: httpParams, ...this.httpOptions }
    ).pipe(
      retry(1),
      catchError(this.handleError<any>('getRefundRequests'))
    );
  }

  /**
   * Process a refund request (approve or reject)
   * @param requestId The ID of the request to process
   * @param payload Action and optional reason
   * @returns Observable of processing response
   */
  processRefundRequest(
    requestId: string, 
    payload: RefundActionPayload
  ): Observable<RefundActionResponse> {
    if (!requestId || requestId.trim() === '') {
      return throwError(() => new Error('Request ID is required'));
    }
    
    if (!['approve', 'reject'].includes(payload.action)) {
      return throwError(() => new Error('Invalid action. Must be "approve" or "reject"'));
    }
    
    if (payload.action === 'reject' && (!payload.reason || payload.reason.trim() === '')) {
      return throwError(() => new Error('Rejection reason is required'));
    }

    return this.http.patch<RefundActionResponse>(
      `${this.baseUrl}/refund-requests/${requestId}/process`,
      payload,
      this.httpOptions
    ).pipe(
      catchError(this.handleError<any>('processRefundRequest'))
    );
  }

  /**
   * Generic error handler for HTTP requests
   */
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      if (error.status === 401) {
        return throwError(() => new Error('Session expired. Please login again.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('You do not have permission to perform this action.'));
      }
      if (error.status === 404) {
        return throwError(() => new Error('Resource not found.'));
      }
      if (error.status === 409) {
        return throwError(() => new Error('This request has already been processed.'));
      }
      if (error.status === 400) {
        return throwError(() => new Error(error.error?.message || 'Insufficient wallet balance to process refund.'));
      }
      if (error.status >= 500) {
        return throwError(() => new Error('Server error. Please try again later.'));
      }

      const errorMessage = error.error?.message || error.message || 'An unexpected error occurred.';
      return throwError(() => new Error(errorMessage));
    };
  }
}
```

#### Step 3: Create Refund Requests Component

**File:** `src/app/pages/distributor/finance/refund-requests/refund-requests.ts`

```typescript
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
```

#### Step 4: Create Template

**File:** `src/app/pages/distributor/finance/refund-requests/refund-requests.html`

```html
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">Refund Requests</h1>
  </div>

  @if (errorMessage) {
    <div class="error-banner" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
      <button class="btn-close-error" (click)="errorMessage = ''" aria-label="Close error">×</button>
    </div>
  }

  <div class="filters">
    <div class="filter-group">
      <label for="statusFilter">Status:</label>
      <select id="statusFilter" [(ngModel)]="statusFilter" (change)="onFilterChange()">
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="searchTerm">Search:</label>
      <input 
        type="text" 
        id="searchTerm"
        [(ngModel)]="searchTerm" 
        (input)="onSearchChange()" 
        placeholder="Merchant name or AWB"
        aria-label="Search requests"
      >
    </div>
  </div>

  @if (isLoading) {
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Loading requests...</p>
    </div>
  }

  @if (!isLoading && filteredRequests.length === 0) {
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>No refund requests found.</p>
    </div>
  }

  @if (!isLoading && filteredRequests.length > 0) {
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Merchant</th>
            <th>AWB</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (request of filteredRequests; track request.id) {
            <tr>
              <td><code>{{ request.id }}</code></td>
              <td>
                <div>{{ request.merchantName }}</div>
                <small>{{ request.merchantEmail }}</small>
              </td>
              <td><code>{{ request.awb }}</code></td>
              <td><strong>₹{{ request.amount.toLocaleString('en-IN') }}</strong></td>
              <td>{{ request.reason }}</td>
              <td>
                <span class="status-badge" 
                      [class.pending]="request.status === 'Pending'"
                      [class.approved]="request.status === 'Approved'"
                      [class.rejected]="request.status === 'Rejected'"
                      role="status">
                  {{ request.status }}
                </span>
              </td>
              <td>{{ request.submittedAt | date:'medium' }}</td>
              <td>
                @if (request.status === 'Pending') {
                  <button 
                    class="btn-approve" 
                    (click)="approveRequest(request)" 
                    [disabled]="isProcessing"
                    aria-label="Approve refund of ₹{{ request.amount }}">
                    Approve
                  </button>
                  <button 
                    class="btn-reject" 
                    (click)="openRejectModal(request)" 
                    [disabled]="isProcessing"
                    aria-label="Reject refund of ₹{{ request.amount }}">
                    Reject
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Reject Modal -->
@if (showRejectModal) {
  <div class="modal-overlay" (click)="closeRejectModal()" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <h2 id="reject-modal-title">Reject Refund Request</h2>
      <p>Merchant: <strong>{{ selectedRequest?.merchantName }}</strong></p>
      <p>Amount: <strong>₹{{ selectedRequest?.amount?.toLocaleString('en-IN') }}</strong></p>
      
      @if (errorMessage) {
        <div class="error-message" role="alert">{{ errorMessage }}</div>
      }
      
      <div class="form-group">
        <label for="rejectionReason">Rejection Reason <span aria-hidden="true">*</span><span class="sr-only">(required)</span></label>
        <textarea 
          id="rejectionReason"
          [(ngModel)]="rejectionReason" 
          rows="4" 
          placeholder="Enter reason for rejection..."
          [attr.aria-invalid]="errorMessage ? 'true' : 'false'"
        ></textarea>
      </div>
      
      <div class="modal-actions">
        <button class="btn-cancel" (click)="closeRejectModal()">Cancel</button>
        <button 
          class="btn-reject" 
          (click)="rejectRequest()" 
          [disabled]="isProcessing || !rejectionReason.trim()">
          Reject Request
        </button>
      </div>
    </div>
  </div>
}
```

### Best Practices Applied
- ✅ Strong TypeScript typing
- ✅ RxJS cleanup with Subject
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Loading and processing states
- ✅ User confirmation
- ✅ Form validation
- ✅ Accessibility features
- ✅ Filtering and search
- ✅ Modal with validation
- ✅ Lifecycle management

---

## 3. Payment History Page

**Status:** Backend exists, uses Transactions page currently

### Backend Endpoint (Already Exists)
```
GET /api/finance/payments
GET /api/finance/payments/:id
```

### Implementation Plan

#### Step 1: Define TypeScript Interfaces

**File:** `src/app/models/payment.model.ts`

```typescript
export type PaymentStatus = 'Success' | 'Failed' | 'Pending';

export interface Payment {
  id: string;
  orderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  userId: string;
  userName: string;
  createdAt: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentParams {
  status?: PaymentStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface PaymentDetailResponse {
  success: boolean;
  data: Payment;
  message?: string;
}
```

#### Step 2: Add Service Methods to FinanceService

**File:** `src/app/services/finance.service.ts`

```typescript
/**
 * Fetch payment history with optional filtering
 * @param params Query parameters for filtering and pagination
 * @returns Observable of payment history
 */
getPayments(params: PaymentParams = {}): Observable<PaymentResponse> {
  let httpParams = new HttpParams();
  
  if (params.status) httpParams = httpParams.set('status', params.status);
  if (params.page) httpParams = httpParams.set('page', params.page.toString());
  if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
  if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
  if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);

  return this.http.get<PaymentResponse>(
    `${this.baseUrl}/payments`,
    { params: httpParams, ...this.httpOptions }
  ).pipe(
    retry(1),
    catchError(this.handleError<any>('getPayments'))
  );
}

/**
 * Get payment details by ID
 * @param id The payment ID
 * @returns Observable of payment details
 */
getPaymentById(id: string): Observable<PaymentDetailResponse> {
  if (!id || id.trim() === '') {
    return throwError(() => new Error('Payment ID is required'));
  }

  return this.http.get<PaymentDetailResponse>(
    `${this.baseUrl}/payments/${id}`,
    this.httpOptions
  ).pipe(
    catchError(this.handleError<any>('getPaymentById'))
  );
}
```

#### Step 3: Create Payment History Component

**File:** `src/app/pages/distributor/finance/payment-history/payment-history.ts`

```typescript
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
```

#### Step 4: Create Template

**File:** `src/app/pages/distributor/finance/payment-history/payment-history.html`

```html
<div class="page-container">
  <div class="page-header">
    <h1 class="page-title">Payment History</h1>
  </div>

  @if (errorMessage) {
    <div class="error-banner" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
      <button class="btn-close-error" (click)="errorMessage = ''" aria-label="Close error">×</button>
    </div>
  }

  <div class="filters">
    <div class="filter-group">
      <label for="statusFilter">Status:</label>
      <select id="statusFilter" [(ngModel)]="statusFilter" (change)="onFilterChange()">
        <option value="All">All</option>
        <option value="Success">Success</option>
        <option value="Failed">Failed</option>
        <option value="Pending">Pending</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="startDate">Start Date:</label>
      <input type="date" id="startDate" [(ngModel)]="startDate" (change)="onFilterChange()">
    </div>
    <div class="filter-group">
      <label for="endDate">End Date:</label>
      <input type="date" id="endDate" [(ngModel)]="endDate" (change)="onFilterChange()">
    </div>
    <div class="filter-group">
      <label for="searchTerm">Search:</label>
      <input 
        type="text" 
        id="searchTerm"
        [(ngModel)]="searchTerm" 
        (input)="onSearchChange()" 
        placeholder="Payment ID or Order ID"
        aria-label="Search payments"
      >
    </div>
  </div>

  @if (isLoading) {
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Loading payment history...</p>
    </div>
  }

  @if (!isLoading && filteredPayments.length === 0) {
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </svg>
      <p>No payment records found.</p>
    </div>
  }

  @if (!isLoading && filteredPayments.length > 0) {
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (payment of filteredPayments; track payment.id) {
            <tr>
              <td><code>{{ payment.razorpayPaymentId }}</code></td>
              <td><code>{{ payment.orderId }}</code></td>
              <td><strong>₹{{ payment.amount.toLocaleString('en-IN') }}</strong></td>
              <td>{{ payment.paymentMethod }}</td>
              <td>
                <span class="status-badge" 
                      [class.success]="payment.status === 'Success'"
                      [class.failed]="payment.status === 'Failed'"
                      [class.pending]="payment.status === 'Pending'"
                      role="status">
                  {{ payment.status }}
                </span>
              </td>
              <td>{{ payment.createdAt | date:'medium' }}</td>
              <td>
                <button 
                  class="btn-view" 
                  (click)="viewDetails(payment)"
                  aria-label="View details for payment {{ payment.razorpayPaymentId }}">
                  View Details
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Detail Modal -->
@if (showDetailModal && selectedPayment) {
  <div class="modal-overlay" (click)="closeDetailModal()" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <h2 id="payment-detail-title">Payment Details</h2>
      <div class="detail-grid">
        <div class="detail-item">
          <label>Payment ID:</label>
          <span><code>{{ selectedPayment.razorpayPaymentId }}</code></span>
        </div>
        <div class="detail-item">
          <label>Order ID:</label>
          <span><code>{{ selectedPayment.orderId }}</code></span>
        </div>
        <div class="detail-item">
          <label>Amount:</label>
          <span><strong>₹{{ selectedPayment.amount.toLocaleString('en-IN') }}</strong></span>
        </div>
        <div class="detail-item">
          <label>Currency:</label>
          <span>{{ selectedPayment.currency }}</span>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <span class="status-badge" 
                [class.success]="selectedPayment.status === 'Success'"
                [class.failed]="selectedPayment.status === 'Failed'"
                [class.pending]="selectedPayment.status === 'Pending'"
                role="status">
            {{ selectedPayment.status }}
          </span>
        </div>
        <div class="detail-item">
          <label>Payment Method:</label>
          <span>{{ selectedPayment.paymentMethod }}</span>
        </div>
        <div class="detail-item">
          <label>Date:</label>
          <span>{{ selectedPayment.createdAt | date:'full' }}</span>
        </div>
        @if (selectedPayment.description) {
          <div class="detail-item full-width">
            <label>Description:</label>
            <span>{{ selectedPayment.description }}</span>
          </div>
        }
      </div>
      <div class="modal-actions">
        <button class="btn-close" (click)="closeDetailModal()">Close</button>
      </div>
    </div>
  </div>
}
```

### Best Practices Applied
- ✅ Strong TypeScript typing
- ✅ RxJS cleanup
- ✅ Comprehensive error handling
- ✅ Date range filtering
- ✅ Status filtering
- ✅ Search functionality
- ✅ Detail modal
- ✅ Loading states
- ✅ Accessibility features
- ✅ Lifecycle management

---

## 4. Reports (COD, Wallet, Payment)

**Status:** Backend endpoints missing

### Backend Implementation Required

#### COD Report Endpoint

**File:** `vexaro-backend/src/modules/reports/report.controller.js`

```javascript
const COD = require('../models/cod.model');

/**
 * Get COD report with summary and detailed records
 * @route GET /api/reports/cod
 * @access Private (Distributor, Super Admin)
 */
exports.getCODReport = async (req, res) => {
  try {
    const { startDate, endDate, merchantId, distributorId, status } = req.query;
    
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Build query
    const query = {};
    if (startDate) query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    if (merchantId) query.merchantId = merchantId;
    if (distributorId) query.distributorId = distributorId;
    if (status) query.status = status;

    // Fetch COD records
    const codRecords = await COD.find(query)
      .populate('merchantId', 'name email')
      .populate('shipmentId', 'awb')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit to prevent memory issues

    // Calculate summary
    const summary = {
      totalCOD: codRecords.length,
      totalAmount: codRecords.reduce((sum, cod) => sum + (cod.amount || 0), 0),
      remittedCOD: codRecords.filter(cod => cod.status === 'Remitted').length,
      remittedAmount: codRecords
        .filter(cod => cod.status === 'Remitted')
        .reduce((sum, cod) => sum + (cod.amount || 0), 0),
      pendingCOD: codRecords.filter(cod => cod.status === 'Pending').length,
      pendingAmount: codRecords
        .filter(cod => cod.status === 'Pending')
        .reduce((sum, cod) => sum + (cod.amount || 0), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        records: codRecords,
        total: codRecords.length
      }
    });
  } catch (error) {
    console.error('Error fetching COD report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch COD report'
    });
  }
};
```

#### Wallet Report Endpoint

```javascript
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');

/**
 * Get wallet report with summary and transaction history
 * @route GET /api/reports/wallet
 * @access Private (Distributor, Super Admin)
 */
exports.getWalletReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, distributorId } = req.query;
    
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Build query
    const query = {};
    if (startDate) query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    if (userId) query.userId = userId;
    if (distributorId) query.distributorId = distributorId;

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);

    // Calculate summary
    const credits = transactions.filter(t => t.type === 'Credit');
    const debits = transactions.filter(t => t.type === 'Debit');
    
    const summary = {
      openingBalance: 0, // Calculate from first transaction or wallet snapshot
      totalCredits: credits.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalDebits: debits.reduce((sum, t) => sum + (t.amount || 0), 0),
      closingBalance: transactions.reduce((sum, t) => 
        t.type === 'Credit' ? sum + (t.amount || 0) : sum - (t.amount || 0), 
        0
      ),
      totalTransactions: transactions.length
    };

    res.json({
      success: true,
      data: {
        summary,
        transactions,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching wallet report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet report'
    });
  }
};
```

#### Payment Report Endpoint

```javascript
const Payment = require('../models/payment.model');

/**
 * Get payment report with summary and payment history
 * @route GET /api/reports/payments
 * @access Private (Distributor, Super Admin)
 */
exports.getPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    // Build query
    const query = {};
    if (startDate) query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // Fetch payments
    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);

    // Calculate summary
    const summary = {
      totalPayments: payments.length,
      successfulPayments: payments.filter(p => p.status === 'Success').length,
      failedPayments: payments.filter(p => p.status === 'Failed').length,
      pendingPayments: payments.filter(p => p.status === 'Pending').length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      successfulAmount: payments
        .filter(p => p.status === 'Success')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        payments,
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Error fetching payment report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment report'
    });
  }
};
```

### Frontend Implementation

After backend endpoints are implemented, add to ReportsService:

**File:** `src/app/services/reports.service.ts`

```typescript
/**
 * Get COD report
 * @param params Query parameters for filtering
 * @returns Observable of COD report
 */
getCODReport(params: any = {}): Observable<any> {
  let httpParams = new HttpParams();
  if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
  if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
  if (params.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
  if (params.status) httpParams = httpParams.set('status', params.status);
  
  return this.http.get<any>(`${this.baseUrl}/reports/cod`, { params: httpParams }).pipe(
    retry(1),
    catchError(this.handleError<any>('getCODReport'))
  );
}

/**
 * Get wallet report
 * @param params Query parameters for filtering
 * @returns Observable of wallet report
 */
getWalletReport(params: any = {}): Observable<any> {
  let httpParams = new HttpParams();
  if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
  if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
  if (params.userId) httpParams = httpParams.set('userId', params.userId);
  
  return this.http.get<any>(`${this.baseUrl}/reports/wallet`, { params: httpParams }).pipe(
    retry(1),
    catchError(this.handleError<any>('getWalletReport'))
  );
}

/**
 * Get payment report
 * @param params Query parameters for filtering
 * @returns Observable of payment report
 */
getPaymentReport(params: any = {}): Observable<any> {
  let httpParams = new HttpParams();
  if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
  if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
  if (params.status) httpParams = httpParams.set('status', params.status);
  if (params.paymentMethod) httpParams = httpParams.set('paymentMethod', params.paymentMethod);
  
  return this.http.get<any>(`${this.baseUrl}/reports/payments`, { params: httpParams }).pipe(
    retry(1),
    catchError(this.handleError<any>('getPaymentReport'))
  );
}
```

Then create report components following the pattern established in existing report pages (profit-report, merchant-revenue, etc.).

---

## 5. Async Export Jobs

**Status:** Backend endpoint missing

### Backend Implementation Required

#### Export Job Model

**File:** `vexaro-backend/src/models/export-job.model.js`

```javascript
const mongoose = require('mongoose');

const exportJobSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reportType: { 
    type: String, 
    required: true,
    enum: ['shipments', 'transactions', 'cod', 'wallet', 'payments', 'merchants']
  },
  filters: { 
    type: Object, 
    default: {} 
  },
  status: { 
    type: String, 
    enum: ['Processing', 'Completed', 'Failed'], 
    default: 'Processing' 
  },
  progress: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  filename: { 
    type: String 
  },
  filePath: {
    type: String
  },
  error: { 
    type: String 
  },
  completedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient queries
exportJobSchema.index({ userId: 1, createdAt: -1 });
exportJobSchema.index({ status: 1 });

module.exports = mongoose.model('ExportJob', exportJobSchema);
```

#### Export Job Controller

**File:** `vexaro-backend/src/modules/reports/export.controller.js`

```javascript
const ExportJob = require('../models/export-job.model');
const fs = require('fs');
const path = require('path');
const csv = require('csv-writer');

/**
 * Create an async export job
 * @route POST /api/reports/export
 * @access Private
 */
exports.createExportJob = async (req, res) => {
  try {
    const { reportType, filters } = req.body;
    const userId = req.user.id;

    // Validate report type
    const validReportTypes = ['shipments', 'transactions', 'cod', 'wallet', 'payments', 'merchants'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    const exportJob = new ExportJob({
      userId,
      reportType,
      filters: filters || {},
      status: 'Processing',
      progress: 0
    });

    await exportJob.save();

    // Start async processing (fire and forget)
    processExportJob(exportJob.id).catch(err => {
      console.error('Export job processing error:', err);
    });

    res.json({
      success: true,
      data: {
        jobId: exportJob.id,
        status: 'Processing',
        message: 'Export job started'
      }
    });
  } catch (error) {
    console.error('Error creating export job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create export job'
    });
  }
};

/**
 * Get export job status
 * @route GET /api/reports/export/:jobId
 * @access Private
 */
exports.getExportJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const exportJob = await ExportJob.findOne({ _id: jobId, userId });

    if (!exportJob) {
      return res.status(404).json({
        success: false,
        message: 'Export job not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: exportJob.id,
        reportType: exportJob.reportType,
        status: exportJob.status,
        progress: exportJob.progress,
        filename: exportJob.filename,
        error: exportJob.error,
        completedAt: exportJob.completedAt,
        createdAt: exportJob.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching export job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch export job status'
    });
  }
};

/**
 * Download exported file
 * @route GET /api/reports/export/download/:filename
 * @access Private
 */
exports.downloadExport = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Verify user owns this export
    const exportJob = await ExportJob.findOne({ 
      userId, 
      filename,
      status: 'Completed' 
    });

    if (!exportJob) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found or not ready'
      });
    }

    const filePath = path.join(__dirname, '../../exports', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Export file not found on server'
      });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download file'
        });
      }
    });
  } catch (error) {
    console.error('Error downloading export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download export'
    });
  }
};

/**
 * Process export job asynchronously
 * @param {string} jobId - The export job ID
 */
async function processExportJob(jobId) {
  const job = await ExportJob.findById(jobId);
  
  if (!job) {
    console.error(`Export job ${jobId} not found`);
    return;
  }

  try {
    // Update progress
    await ExportJob.findByIdAndUpdate(jobId, { progress: 10 });

    // Generate report based on type
    let csvData;
    let filename;
    
    switch (job.reportType) {
      case 'shipments':
        csvData = await generateShipmentExport(job.filters);
        filename = `shipments_${jobId}_${Date.now()}.csv`;
        break;
      case 'transactions':
        csvData = await generateTransactionExport(job.filters);
        filename = `transactions_${jobId}_${Date.now()}.csv`;
        break;
      case 'cod':
        csvData = await generateCODExport(job.filters);
        filename = `cod_${jobId}_${Date.now()}.csv`;
        break;
      case 'wallet':
        csvData = await generateWalletExport(job.filters);
        filename = `wallet_${jobId}_${Date.now()}.csv`;
        break;
      case 'payments':
        csvData = await generatePaymentExport(job.filters);
        filename = `payments_${jobId}_${Date.now()}.csv`;
        break;
      case 'merchants':
        csvData = await generateMerchantExport(job.filters);
        filename = `merchants_${jobId}_${Date.now()}.csv`;
        break;
      default:
        throw new Error(`Unknown report type: ${job.reportType}`);
    }

    await ExportJob.findByIdAndUpdate(jobId, { progress: 50 });

    // Save to file
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filePath = path.join(exportsDir, filename);
    fs.writeFileSync(filePath, csvData);

    // Update job status
    await ExportJob.findByIdAndUpdate(jobId, {
      status: 'Completed',
      progress: 100,
      filename,
      filePath,
      completedAt: new Date()
    });

    // Send email notification (optional)
    // await sendExportCompleteNotification(job.userId, filename);

    console.log(`Export job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`Export job ${jobId} processing error:`, error);
    
    await ExportJob.findByIdAndUpdate(jobId, {
      status: 'Failed',
      error: error.message
    });
  }
}

// Helper functions for generating exports
async function generateShipmentExport(filters) {
  // Implementation depends on your data model
  // Return CSV string
  return 'shipment_id,awb,merchant,status,created_at\n...';
}

async function generateTransactionExport(filters) {
  // Implementation depends on your data model
  return 'transaction_id,type,amount,created_at\n...';
}

async function generateCODExport(filters) {
  // Implementation depends on your data model
  return 'cod_id,amount,status,created_at\n...';
}

async function generateWalletExport(filters) {
  // Implementation depends on your data model
  return 'transaction_id,type,amount,balance,created_at\n...';
}

async function generatePaymentExport(filters) {
  // Implementation depends on your data model
  return 'payment_id,order_id,amount,status,created_at\n...';
}

async function generateMerchantExport(filters) {
  // Implementation depends on your data model
  return 'merchant_id,name,email,status,created_at\n...';
}
```

#### Routes

**File:** `vexaro-backend/src/modules/reports/report.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const exportController = require('./export.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { createExportJobSchema } = require('../validation/schemas/export.schema');
const validateRequest = require('../middleware/validate-request.middleware');

router.post('/export', authMiddleware, validateRequest({ body: createExportJobSchema }), exportController.createExportJob);
router.get('/export/:jobId', authMiddleware, exportController.getExportJobStatus);
router.get('/export/download/:filename', authMiddleware, exportController.downloadExport);

module.exports = router;
```

### Frontend Implementation

**File:** `src/app/services/reports.service.ts`

```typescript
/**
 * Create an async export job
 * @param reportType The type of report to export
 * @param filters Optional filters for the report
 * @returns Observable of export job creation response
 */
createExportJob(reportType: string, filters: any = {}): Observable<any> {
  const validReportTypes = ['shipments', 'transactions', 'cod', 'wallet', 'payments', 'merchants'];
  
  if (!validReportTypes.includes(reportType)) {
    return throwError(() => new Error('Invalid report type'));
  }

  return this.http.post<any>(`${this.baseUrl}/reports/export`, { reportType, filters }).pipe(
    catchError(this.handleError<any>('createExportJob'))
  );
}

/**
 * Get export job status
 * @param jobId The export job ID
 * @returns Observable of export job status
 */
getExportJobStatus(jobId: string): Observable<any> {
  if (!jobId || jobId.trim() === '') {
    return throwError(() => new Error('Job ID is required'));
  }

  return this.http.get<any>(`${this.baseUrl}/reports/export/${jobId}`).pipe(
    catchError(this.handleError<any>('getExportJobStatus'))
  );
}

/**
 * Download exported file
 * @param filename The filename to download
 */
downloadExport(filename: string): void {
  if (!filename || filename.trim() === '') {
    console.error('Filename is required');
    return;
  }

  const token = localStorage.getItem('accessToken');
  const url = `${this.baseUrl}/reports/export/download/${filename}`;
  
  // Open in new tab with auth header
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.setAttribute('download', filename);
  
  // For authenticated downloads, you may need to use fetch + blob
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Error downloading file:', error);
    alert('Failed to download file. Please try again.');
  });
}
```

**File:** `src/app/pages/distributor/reports/export-manager/export-manager.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-export-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export-manager.html',
  styleUrl: './export-manager.css'
})
export class ExportManager implements OnInit, OnDestroy {
  // State
  exportJob: any = null;
  isExporting: boolean = false;
  errorMessage: string = '';
  
  // Form
  reportType: string = 'shipments';
  filters: any = {};
  
  // Polling
  pollingInterval: any;
  private destroy$ = new Subject<void>();

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  startExport(): void {
    this.isExporting = true;
    this.errorMessage = '';

    this.reportsService.createExportJob(this.reportType, this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.exportJob = response.data;
            this.startPolling(response.data.jobId);
          } else {
            this.errorMessage = response.message || 'Failed to start export';
            this.isExporting = false;
          }
        },
        error: (error) => {
          this.isExporting = false;
          this.errorMessage = error.message || 'Failed to start export. Please try again.';
        }
      });
  }

  startPolling(jobId: string): void {
    this.pollingInterval = interval(3000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.reportsService.getExportJobStatus(jobId).subscribe({
        next: (response) => {
          if (response.success) {
            this.exportJob = response.data;
            
            if (response.data.status === 'Completed') {
              this.stopPolling();
              this.isExporting = false;
              alert('Export completed successfully!');
            } else if (response.data.status === 'Failed') {
              this.stopPolling();
              this.isExporting = false;
              this.errorMessage = response.data.error || 'Export failed';
            }
          }
        },
        error: (error) => {
          console.error('Error polling export status:', error);
        }
      });
    });
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
  }

  downloadFile(): void {
    if (this.exportJob && this.exportJob.filename) {
      this.reportsService.downloadExport(this.exportJob.filename);
    }
  }

  cancelExport(): void {
    this.stopPolling();
    this.isExporting = false;
    this.exportJob = null;
  }
}
```

### Best Practices Applied
- ✅ Async job processing
- ✅ Progress tracking
- ✅ Polling mechanism with cleanup
- ✅ Error handling
- ✅ File download with auth
- ✅ Validation
- ✅ Status management
- ✅ RxJS operators

---

## 6. Bulk Upload Status Polling

**Status:** Backend endpoint missing

### Backend Implementation

#### Bulk Upload Controller

**File:** `vexaro-backend/src/modules/shipments/bulk-upload.controller.js`

```javascript
const BulkUpload = require('../models/bulk-upload.model');

/**
 * Get bulk upload status
 * @route GET /api/shipments/bulk-upload/:jobId
 * @access Private
 */
exports.getBulkUploadStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const bulkUpload = await BulkUpload.findOne({ _id: jobId, userId });

    if (!bulkUpload) {
      return res.status(404).json({
        success: false,
        message: 'Bulk upload job not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: bulkUpload.id,
        status: bulkUpload.status, // Processing, Completed, PartiallyCompleted, Failed
        progress: bulkUpload.progress,
        totalRecords: bulkUpload.totalRecords,
        processedRecords: bulkUpload.processedRecords,
        successfulRecords: bulkUpload.successfulRecords,
        failedRecords: bulkUpload.failedRecords,
        errors: bulkUpload.errors || [],
        completedAt: bulkUpload.completedAt,
        createdAt: bulkUpload.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching bulk upload status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bulk upload status'
    });
  }
};
```

**Route:** `GET /api/shipments/bulk-upload/:jobId`

### Frontend Implementation

**File:** `src/app/services/shipment.service.ts`

```typescript
/**
 * Get bulk upload status
 * @param jobId The bulk upload job ID
 * @returns Observable of bulk upload status
 */
getBulkUploadStatus(jobId: string): Observable<any> {
  if (!jobId || jobId.trim() === '') {
    return throwError(() => new Error('Job ID is required'));
  }

  return this.http.get<any>(`${this.baseUrl}/shipments/bulk-upload/${jobId}`).pipe(
    catchError(this.handleError<any>('getBulkUploadStatus'))
  );
}
```

**File:** `src/app/pages/distributor/shipments/bulk-upload-status/bulk-upload-status.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { ShipmentService } from '../../../../services/shipment.service';

@Component({
  selector: 'app-bulk-upload-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload-status.html',
  styleUrl: './bulk-upload-status.css'
})
export class BulkUploadStatus implements OnInit, OnDestroy {
  uploadStatus: any = null;
  pollingInterval: any;
  private destroy$ = new Subject<void>();

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit(): void {
    // Assuming jobId is passed via route param or input
    // this.startPolling(jobId);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  startPolling(jobId: string): void {
    this.pollingInterval = interval(2000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.shipmentService.getBulkUploadStatus(jobId).subscribe({
        next: (response) => {
          if (response.success) {
            this.uploadStatus = response.data;
            
            if (['Completed', 'PartiallyCompleted', 'Failed'].includes(response.data.status)) {
              this.stopPolling();
            }
          }
        },
        error: (error) => {
          console.error('Error polling bulk upload status:', error);
        }
      });
    });
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
  }
}
```

### Best Practices Applied
- ✅ Real-time status updates
- ✅ Detailed error reporting
- ✅ Progress tracking
- ✅ Polling with cleanup
- ✅ Multiple status handling
- ✅ RxJS interval operator

---

## 7. Dispute Comment Endpoint

**Status:** Backend endpoint missing (documented in Phase 5)

### Backend Implementation

#### Dispute Controller

**File:** `vexaro-backend/src/modules/disputes/dispute.controller.js`

```javascript
const WeightDispute = require('../models/weight-dispute.model');

/**
 * Add comment to dispute
 * @route POST /api/disputes/:id/comments
 * @access Private
 */
exports.addDisputeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const dispute = await WeightDispute.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check if user has permission to comment
    // (e.g., only involved parties can comment)
    if (dispute.merchantId.toString() !== userId && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'DISTRIBUTOR') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this dispute'
      });
    }

    const newComment = {
      userId,
      comment: comment.trim(),
      createdAt: new Date()
    };

    dispute.comments.push(newComment);
    await dispute.save();

    // Notify relevant parties
    // await notifyDisputeComment(dispute, userId, comment);

    res.json({
      success: true,
      data: {
        id: newComment._id,
        comment: newComment.comment,
        userId: newComment.userId,
        createdAt: newComment.createdAt
      },
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding dispute comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};
```

#### Dispute Model Update

**File:** `vexaro-backend/src/models/weight-dispute.model.js`

```javascript
// Add comments array to WeightDispute schema
comments: [{
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  comment: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}]
```

#### Route

**File:** `vexaro-backend/src/modules/disputes/dispute.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const disputeController = require('./dispute.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { addCommentSchema } = require('../validation/schemas/dispute.schema');
const validateRequest = require('../middleware/validate-request.middleware');

router.post('/:id/comments', authMiddleware, validateRequest({ body: addCommentSchema }), disputeController.addDisputeComment);

module.exports = router;
```

### Frontend Already Implemented

The frontend already has the service method and UI for adding comments. Once the backend endpoint is implemented, it will work immediately.

**File:** `src/app/services/dispute.service.ts` (already exists)

```typescript
/**
 * Add comment to dispute
 * @param id The dispute ID
 * @param comment The comment text
 * @returns Observable of comment addition response
 */
addComment(id: string, comment: string): Observable<any> {
  if (!id || id.trim() === '') {
    return throwError(() => new Error('Dispute ID is required'));
  }
  
  if (!comment || comment.trim() === '') {
    return throwError(() => new Error('Comment is required'));
  }

  return this.http.post<any>(`${this.baseUrl}/disputes/${id}/comments`, { comment: comment.trim() }).pipe(
    catchError(this.handleError<any>('addComment'))
  );
}
```

---

## 8. Common Patterns & Utilities

### Error Handling Pattern

**File:** `src/app/core/error-handler.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  /**
   * Handle HTTP errors with user-friendly messages
   * @param error The error object
   * @returns Observable that throws formatted error
   */
  handleHttpError(error: any): Observable<never> {
    const apiError: ApiError = {
      status: error.status || 0,
      message: this.getUserFriendlyMessage(error),
      details: error
    };

    console.error('API Error:', apiError);

    // Handle specific scenarios
    if (error.status === 401) {
      this.handleUnauthorized();
    }

    return throwError(() => apiError);
  }

  /**
   * Get user-friendly error message
   * @param error The error object
   * @returns User-friendly message
   */
  private getUserFriendlyMessage(error: any): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    if (error.status === 400) {
      return error.error?.message || 'Invalid request. Please check your input.';
    }
    if (error.status === 401) {
      return 'Session expired. Please login again.';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.status === 404) {
      return 'Resource not found.';
    }
    if (error.status === 409) {
      return 'This resource has already been processed.';
    }
    if (error.status === 422) {
      return error.error?.message || 'Validation error.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.error?.message || error.message || 'An unexpected error occurred.';
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(): void {
    // Clear auth tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### Loading State Pattern

**File:** `src/app/core/loading-state.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingStateService {
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  /**
   * Set loading state for a specific operation
   * @param key The operation key
   * @param loading The loading state
   */
  setLoading(key: string, loading: boolean): void {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    this.loadingStates.get(key)!.next(loading);
  }

  /**
   * Get loading state observable for a specific operation
   * @param key The operation key
   * @returns Observable of loading state
   */
  getLoading(key: string): BehaviorSubject<boolean> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(key)!;
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.forEach(state => state.next(false));
  }
}
```

### Validation Utilities

**File:** `src/app/core/validation.utils.ts`

```typescript
/**
 * Validate email address
 * @param email The email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 * @param phone The phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate pincode (Indian format)
 * @param pincode The pincode to validate
 * @returns True if valid
 */
export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Validate URL
 * @param url The URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 * @param input The input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
```

### Date Utilities

**File:** `src/app/core/date.utils.ts`

```typescript
/**
 * Format date to readable string
 * @param date The date to format
 * @param format The format string
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  };

  return d.toLocaleDateString('en-IN', options[format]);
}

/**
 * Get date range for common periods
 * @param period The period type
 * @returns Object with startDate and endDate
 */
export function getDateRange(period: 'today' | 'week' | 'month' | 'year'): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(now.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}
```

### Debounce Directive

**File:** `src/app/core/debounce.directive.ts`

```typescript
import { Directive, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[appDebounce]',
  standalone: true
})
export class DebounceDirective {
  @Input() debounceTime = 300;
  @Output() debounceChange = new EventEmitter<any>();

  private subject = new Subject<any>();

  ngOnInit(): void {
    this.subject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(value => {
      this.debounceChange.emit(value);
    });
  }

  @Input()
  set appDebounce(value: any) {
    this.subject.next(value);
  }
}
```

---

## Summary of Implementation Patterns

### Common Patterns Applied

1. **Service Layer**
   - Centralized API calls
   - Consistent error handling
   - Type-safe interfaces
   - Query parameter handling
   - Retry logic for transient failures

2. **Component Layer**
   - Loading states
   - Error handling with user feedback
   - Form validation
   - Confirmation dialogs
   - Reactive data updates
   - Lifecycle management (ngOnDestroy)

3. **Error Handling**
   - 400: Validation errors
   - 401: Session expired (redirect to login)
   - 403: Permission denied
   - 404: Resource not found
   - 409: Conflict (already processed)
   - 422: Unprocessable entity
   - 500: Server error

4. **User Experience**
   - Loading indicators
   - Success/error alerts
   - Confirmation dialogs
   - Modal dialogs for complex actions
   - Empty state messages
   - Accessible markup (ARIA)

5. **Type Safety**
   - TypeScript interfaces for all data structures
   - Strict typing for service methods
   - Type guards for conditional rendering
   - Enum-like types for status values

6. **Performance**
   - Polling with cleanup
   - Debounced search
   - Lazy loading
   - Pagination support
   - RxJS operators optimization

### Backend Implementation Checklist

For each missing backend endpoint:
- [ ] Create controller method
- [ ] Add validation schema
- [ ] Add route with authentication
- [ ] Add error handling
- [ ] Add audit logging
- [ ] Add notification triggers (if applicable)
- [ ] Test with Postman/curl
- [ ] Update API documentation

### Frontend Implementation Checklist

For each new frontend feature:
- [ ] Create service method
- [ ] Create TypeScript interface
- [ ] Create component
- [ ] Create template
- [ ] Add routing
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add form validation
- [ ] Test with mock data
- [ ] Test with real API
- [ ] Add accessibility features
- [ ] Add unit tests
- [ ] Add integration tests

---

## Excluded Features (Per Rules)

**Dashboard Mock Chart Data, FAQs, Live Tracking Mock Data**

These are intentionally excluded per the implementation rules:
- Static informational pages
- CSS/UI-only improvements
- Visual placeholders

These should remain as-is unless explicitly requested to be implemented in a future phase.
