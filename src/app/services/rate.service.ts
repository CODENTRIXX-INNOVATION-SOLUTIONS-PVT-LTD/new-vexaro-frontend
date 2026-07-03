import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RateService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? '/api/v1';
  private http = inject(HttpClient);

  getRateCards(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rates/cards`);
  }

  createRateCard(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rates/cards`, payload);
  }

  getRateCardById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rates/cards/${id}`);
  }

  updateRateCard(id: string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/rates/cards/${id}`, payload);
  }

  deactivateRateCard(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/rates/cards/${id}`);
  }

  getMargins(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/rates/margins`, { params: httpParams });
  }

  saveMarginConfig(distributorId: string, payload: {
    rateCardId: string;
    marginPercent: number;
    flatMargin?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rates/margins`, { distributorId, ...payload });
  }

  calculateRate(payload: {
    weight: number;
    serviceType: string;
    isCOD?: boolean;
    codAmount?: number;
    rateCardId?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rates/calculate`, payload);
  }
}
