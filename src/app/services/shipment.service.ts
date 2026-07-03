import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShipmentListItem {
  id: string;
  awb: string;
  carrierAWB: string | null;
  carrier: string | null;
  status: string;
  merchantCost: number;
  distributorCost: number;
  weight: number;
  isCOD: boolean;
  codAmount: number;
  origin: any;
  destination: any;
  createdAt: string;
}

export interface ShipmentListResponse {
  success: boolean;
  message: string;
  data: { shipments: ShipmentListItem[] };
  meta: any;
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? '/api/v1';
  private http = inject(HttpClient);

  listShipments(params: any = {}): Observable<ShipmentListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<ShipmentListResponse>(`${this.baseUrl}/shipments`, { params: httpParams });
  }

  getShipmentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipments/${id}`);
  }

  createShipment(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/shipments`, payload);
  }

  cancelShipment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/shipments/${id}`);
  }

  checkServiceability(payload: {
    fromPincode: string;
    toPincode: string;
    isCOD?: boolean;
    isForward?: boolean;
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
    codAmount?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/shipments/serviceability`, payload);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipments/stats`);
  }

  trackAWB(awb: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipments/track/${awb}`);
  }

  bulkUpload(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/shipments/bulk-upload`, formData);
  }

  getShipmentsByMerchant(merchantId: string, params: any = {}): Observable<ShipmentListResponse> {
    let httpParams = new HttpParams().set('merchant', merchantId);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<ShipmentListResponse>(`${this.baseUrl}/shipments`, { params: httpParams });
  }
}
