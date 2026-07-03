import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? '/api/v1';
  private http = inject(HttpClient);

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
    return this.http.post<any>(`${this.baseUrl}/finance/transfer`, payload);
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

  // Admin payment dashboard stats
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/admin/stats`);
  }

  // Recharge distributor wallet
  rechargeDistributorWallet(payload: {
    distributorId: string;
    amount: number;
    paymentMethod: string;
    referenceId?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/wallets/recharge`, payload);
  }

  // List commission earnings
  listCommission(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/commission`, { params: httpParams });
  }

  // List refunds
  listRefunds(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/refunds`, { params: httpParams });
  }

  // List recharge requests
  listRechargeRequests(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/recharge-requests`, { params: httpParams });
  }

  // Approve recharge request
  approveRechargeRequest(requestId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-requests/${requestId}/approve`, {});
  }

  // Reject recharge request
  rejectRechargeRequest(requestId: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-requests/${requestId}/reject`, { reason });
  }
}
