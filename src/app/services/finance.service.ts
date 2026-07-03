import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void; on: (event: string, cb: (response: any) => void) => void };
  }
}

type RazorpayMode = 'checkout' | 'upi_qr';

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  method?: string;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
}

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface WalletTopupResult {
  payment: any;
  wallet: any;
  balance: number;
  transaction: any;
  alreadyProcessed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  getMyWallet(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/wallet`);
  }

  listWallets(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page)   httpParams = httpParams.set('page',   params.page.toString());
    if (params.limit)  httpParams = httpParams.set('limit',  params.limit.toString());
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    return this.http.get<any>(`${this.baseUrl}/finance/wallets`, { params: httpParams });
  }

  listTransactions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page)   httpParams = httpParams.set('page',   params.page.toString());
    if (params.limit)  httpParams = httpParams.set('limit',  params.limit.toString());
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    if (params.type)   httpParams = httpParams.set('type',   params.type);
    return this.http.get<any>(`${this.baseUrl}/finance/transactions`, { params: httpParams });
  }

  async startRazorpayWalletTopup(amount: number, mode: RazorpayMode = 'checkout'): Promise<WalletTopupResult> {
    const orderResponse = await firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/finance/razorpay/create-order`, { amount, source: mode }),
    );
    const order = orderResponse?.data;
    if (!order?.keyId || !order?.razorpayOrderId) {
      throw new Error('Invalid Razorpay order response from server.');
    }

    await this.loadRazorpayCheckout();

    const user = this.getStoredUser();
    const checkoutResponse = await new Promise<RazorpayCheckoutResponse>((resolve, reject) => {
      const options: RazorpayCheckoutOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Vexaro Courier Solutions',
        description: mode === 'upi_qr' ? 'Wallet top-up via UPI QR' : 'Wallet top-up',
        order_id: order.razorpayOrderId,
        method: mode === 'upi_qr' ? 'upi' : undefined,
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.companyName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          purpose: 'wallet_topup',
          source: mode,
        },
        theme: {
          color: '#0b4a6f',
        },
        modal: {
          confirm_close: true,
          ondismiss: () => reject(new Error('Payment popup closed before completion.')),
        },
        handler: (response) => resolve(response),
      };

      const razorpay = new window.Razorpay!(options);
      razorpay.on('payment.failed', (response: any) => {
        const description = response?.error?.description || 'Payment failed in Razorpay Checkout.';
        reject(new Error(description));
      });
      razorpay.open();
    });

    const verifyResponse = await firstValueFrom(this.verifyPayment({
      razorpay_order_id: checkoutResponse.razorpay_order_id,
      razorpay_payment_id: checkoutResponse.razorpay_payment_id,
      razorpay_signature: checkoutResponse.razorpay_signature,
    }));

    return verifyResponse.data as WalletTopupResult;
  }

  // Remove the old stubs that had wrong URLs and replace with corrected ones:
  createRazorpayOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/razorpay/create-order`, { amount });
  }

  verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/razorpay/verify`, payload);
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

  // Admin payment dashboard stats
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/admin/stats`);
  }

  // Recharge distributor wallet
  rechargeDistributorWallet(payload: {
    distributorId: string;
    amount: number;
    paymentMethod: 'UPI' | 'NEFT' | 'IMPS' | 'RTGS' | 'Cash' | 'Cheque';
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
    if (params.page)   httpParams = httpParams.set('page',   params.page.toString());
    if (params.limit)  httpParams = httpParams.set('limit',  params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    return this.http.get<any>(`${this.baseUrl}/finance/recharge-requests`, { params: httpParams });
  }

  // List Razorpay payments (wallet top-ups)
  listPayments(params: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page)     httpParams = httpParams.set('page',     params.page.toString());
    if (params.limit)    httpParams = httpParams.set('limit',    params.limit.toString());
    if (params.status)   httpParams = httpParams.set('status',   params.status);
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo)   httpParams = httpParams.set('dateTo',   params.dateTo);
    if (params.userId)   httpParams = httpParams.set('userId',   params.userId);
    return this.http.get<any>(`${this.baseUrl}/finance/payments`, { params: httpParams });
  }

  // Get single Razorpay payment detail
  getPayment(paymentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/finance/payments/${paymentId}`);
  }

  // Submit refund for a Razorpay payment (SA / payment owner)
  refundRazorpayPayment(paymentId: string, reason: string, amount?: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/payments/${paymentId}/refund`, { reason, ...(amount ? { amount } : {}) });
  }

  // Submit refund request for a shipment (merchant)
  submitRefundRequest(payload: { shipmentId: string; amount: number; reason: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/refund-requests`, payload);
  }

  // List refund requests (scoped by role)
  listRefundRequests(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page)  httpParams = httpParams.set('page',  params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/finance/refund-requests`, { params: httpParams });
  }

  // Approve recharge request
  approveRechargeRequest(requestId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-requests/${requestId}/approve`, {});
  }

  // Reject recharge request
  rejectRechargeRequest(requestId: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-requests/${requestId}/reject`, { reason });
  }

  // Distributor: submit a manual recharge request to SA
  createRechargeRequest(payload: {
    amount: number;
    paymentMethod: 'UPI' | 'NEFT' | 'IMPS' | 'RTGS' | 'Cash' | 'Cheque';
    referenceId?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/recharge-requests`, payload);
  }

  // SA: manually add funds to any wallet (topup)
  topupWallet(payload: { userId: string; amount: number; note?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/topup`, payload);
  }

  // SA: manually refund a wallet
  manualRefundWallet(payload: { userId: string; amount: number; note?: string; shipmentId?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finance/refund`, payload);
  }

  // Process refund request (SA/Distributor approve or reject)
  processRefundRequest(
    id: string,
    payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string },
  ): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/finance/refund-requests/${id}/process`, payload);
  }

  // Process settlement (SA marks as COMPLETED or FAILED)
  processSettlementById(id: string, payload: { success: boolean; note?: string }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/finance/settlements/${id}/process`, payload);
  }

  private loadRazorpayCheckout(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'));
      document.body.appendChild(script);
    });
  }

  private getStoredUser(): any {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }
}
