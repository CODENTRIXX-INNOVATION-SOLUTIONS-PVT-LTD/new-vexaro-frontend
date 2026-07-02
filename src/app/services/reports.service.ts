import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  // Main Reports Overview
  getReportsOverview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/overview`);
  }

  // Shipment Reports
  getShipmentTrend(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.period) httpParams = httpParams.set('period', params.period);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/trend`, { params: httpParams });
  }

  getShipmentStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/status`);
  }

  getShipmentSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/summary`);
  }

  getTopMerchantsByShipments(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/top-merchants`, { params: httpParams });
  }

  getRecentShipments(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/recent`, { params: httpParams });
  }

  getShipmentAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/analytics`);
  }

  // Revenue Reports
  getRevenueTrend(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.period) httpParams = httpParams.set('period', params.period);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/trend`, { params: httpParams });
  }

  getRevenueSource(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/source`);
  }

  getRevenueInsights(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/insights`);
  }

  getTopRevenueMerchants(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/top-merchants`, { params: httpParams });
  }

  getRevenueByPaymentMethod(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/payment-methods`);
  }

  getRecentRevenueTransactions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/transactions`, { params: httpParams });
  }

  getRevenueSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/revenue/summary`);
  }

  // Merchant Reports
  getMerchantSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/summary`);
  }

  getMerchantInsights(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/insights`);
  }

  getTopMerchants(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/top`, { params: httpParams });
  }

  getMerchantsByCategory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/categories`);
  }

  getRecentMerchants(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/recent`, { params: httpParams });
  }

  getMerchantGrowth(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.period) httpParams = httpParams.set('period', params.period);
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/growth`, { params: httpParams });
  }

  getMerchantCategoryDistribution(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/merchants/category-distribution`);
  }

  // Distributor Reports
  getDistributorSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/summary`);
  }

  getDistributorInsights(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/insights`);
  }

  getTopDistributors(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/top`, { params: httpParams });
  }

  getRegionalPerformance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/regional`);
  }

  getDistributorActivities(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/activities`, { params: httpParams });
  }

  getDistributorPerformance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/performance`);
  }

  getRegionalDistribution(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/regional-distribution`);
  }
}
