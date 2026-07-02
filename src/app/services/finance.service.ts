import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  RefundRequestParams,
  RefundRequestResponse,
  RefundActionPayload,
  RefundActionResponse
} from '../models/refund-request.model';
import {
  PaymentParams,
  PaymentResponse,
  PaymentDetailResponse
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);
  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  getMyWallet(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/wallet`);
  }

  listWallets(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/wallets`, { params: httpParams });
  }

  listTransactions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/transactions`, { params: httpParams });
  }

  createRazorpayOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/razorpay/create-order`, { amount });
  }

  verifyPayment(payload: {
    paymentId: string;
    orderId: string;
    razorpayPaymentId: string;
    signature: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/razorpay/verify-payment`, payload);
  }

  transferToMerchant(payload: {
    merchantId: string;
    amount: number;
    note?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/transfer-to-merchant`, payload);
  }

  listCOD(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<any>(`${this.baseUrl}/finance/cod`, { params: httpParams });
  }

  remitCOD(codId: string, note?: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/finance/cod/${codId}/remit`, { note });
  }

  listSettlements(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/settlements`, { params: httpParams });
  }

  createSettlement(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/settlements`, payload);
  }

  processSettlement(id: string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/finance/settlements/${id}/process`, payload);
  }

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/admin-stats`);
  }

  listRefunds(params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/refunds`, {
      params: this.buildListParams(params)
    });
  }

  listRechargeRequests(params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/recharge-requests`, {
      params: this.buildListParams(params)
    });
  }

  rechargeDistributorWallet(payload: {
    distributorId: string;
    amount: number;
    paymentMethod?: string;
    referenceId?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-distributor`, {
      userId: payload.distributorId,
      amount: payload.amount,
      note: payload.referenceId || payload.paymentMethod
    });
  }

  approveRechargeRequest(requestId: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/finance/recharge-requests/${requestId}/approve`,
      {}
    );
  }

  rejectRechargeRequest(requestId: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/finance/recharge-requests/${requestId}/reject`,
      { status: 'REJECTED', reviewNote: 'Rejected by administrator' }
    );
  }

  private buildListParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    return httpParams;
  }

  // Refund Request methods
  getRefundRequests(params: RefundRequestParams = {}): Observable<RefundRequestResponse> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<RefundRequestResponse>(
      `${this.baseUrl}/finance/refund-requests`,
      { params: httpParams }
    ).pipe(
      catchError(this.handleError('getRefundRequests'))
    );
  }

  processRefundRequest(requestId: string, payload: RefundActionPayload): Observable<RefundActionResponse> {
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
      `${this.baseUrl}/finance/refund-requests/${requestId}/process`,
      payload,
      { headers: this.jsonHeaders }
    ).pipe(
      catchError(this.handleError('processRefundRequest'))
    );
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
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

  // Payment History methods
  getPayments(params: PaymentParams = {}): Observable<PaymentResponse> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<PaymentResponse>(
      `${this.baseUrl}/finance/payments`,
      { params: httpParams }
    ).pipe(
      catchError(this.handleError('getPayments'))
    );
  }

  getPaymentById(id: string): Observable<PaymentDetailResponse> {
    if (!id || id.trim() === '') {
      return throwError(() => new Error('Payment ID is required'));
    }

    return this.http.get<PaymentDetailResponse>(
      `${this.baseUrl}/finance/payments/${id}`
    ).pipe(
      catchError(this.handleError('getPaymentById'))
    );
  }
}
