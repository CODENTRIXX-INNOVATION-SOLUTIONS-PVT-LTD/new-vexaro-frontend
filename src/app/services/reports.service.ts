import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  // Standard backend report endpoints used by Distributor module
  getShipmentsReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/shipments`, { params: httpParams });
  }

  getMerchantRevenueReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/merchant-revenue`, { params: httpParams });
  }

  getRevenueReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/revenue`, { params: httpParams });
  }

  getPerformanceReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<any>(`${this.baseUrl}/reports/performance`, { params: httpParams });
  }

  // Additional report endpoints (backend already exists)
  getWalletReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.userId) httpParams = httpParams.set('userId', params.userId);
    return this.http.get<any>(`${this.baseUrl}/reports/wallet`, { params: httpParams });
  }

  getCODReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<any>(`${this.baseUrl}/reports/cod`, { params: httpParams });
  }

  getPaymentReport(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.paymentMethod) httpParams = httpParams.set('paymentMethod', params.paymentMethod);
    return this.http.get<any>(`${this.baseUrl}/reports/payment`, { params: httpParams });
  }

  // Async Export Jobs (backend already exists)
  createExportJob(reportType: string, filters: any = {}): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reports/export`, { reportType, filters });
  }

  getExportJobStatus(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/export/${jobId}`);
  }

  downloadExport(filename: string): void {
    const token = localStorage.getItem('accessToken');
    const url = `${this.baseUrl}/reports/export/download/${filename}`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
  }

  // Methods used by Super Admin module (restored for backward compatibility)
  getRecentShipments(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/recent`, { params: httpParams });
  }

  getShipmentAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/shipments/analytics`);
  }

  getDistributorSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reports/distributors/summary`);
  }

  getReportsOverview(params: any = {}): Observable<any> {
    return this.getAdminReport('overview', params);
  }

  getDistributorInsights(params: any = {}): Observable<any> {
    return this.getAdminReport('distributor-insights', params);
  }

  getTopDistributors(params: any = {}): Observable<any> {
    return this.getAdminReport('top-distributors', params);
  }

  getRegionalPerformance(params: any = {}): Observable<any> {
    return this.getAdminReport('regional-performance', params);
  }

  getDistributorActivities(params: any = {}): Observable<any> {
    return this.getAdminReport('distributor-activities', params);
  }

  getDistributorPerformance(params: any = {}): Observable<any> {
    return this.getAdminReport('distributor-performance', params);
  }

  getRegionalDistribution(params: any = {}): Observable<any> {
    return this.getAdminReport('regional-distribution', params);
  }

  getMerchantSummary(params: any = {}): Observable<any> {
    return this.getAdminReport('merchant-summary', params);
  }

  getMerchantInsights(params: any = {}): Observable<any> {
    return this.getAdminReport('merchant-insights', params);
  }

  getTopMerchants(params: any = {}): Observable<any> {
    return this.getAdminReport('top-merchants', params);
  }

  getMerchantsByCategory(params: any = {}): Observable<any> {
    return this.getAdminReport('merchants-by-category', params);
  }

  getRecentMerchants(params: any = {}): Observable<any> {
    return this.getAdminReport('recent-merchants', params);
  }

  getMerchantGrowth(params: any = {}): Observable<any> {
    return this.getAdminReport('merchant-growth', params);
  }

  getMerchantCategoryDistribution(params: any = {}): Observable<any> {
    return this.getAdminReport('merchant-category-distribution', params);
  }

  getRevenueSummary(params: any = {}): Observable<any> {
    return this.getAdminReport('revenue-summary', params);
  }

  getRevenueInsights(params: any = {}): Observable<any> {
    return this.getAdminReport('revenue-insights', params);
  }

  getTopRevenueMerchants(params: any = {}): Observable<any> {
    return this.getAdminReport('top-revenue-merchants', params);
  }

  getRevenueByPaymentMethod(params: any = {}): Observable<any> {
    return this.getAdminReport('revenue-by-payment-method', params);
  }

  getRecentRevenueTransactions(params: any = {}): Observable<any> {
    return this.getAdminReport('recent-revenue-transactions', params);
  }

  getRevenueTrend(params: any = {}): Observable<any> {
    return this.getAdminReport('revenue-trend', params);
  }

  getRevenueSource(params: any = {}): Observable<any> {
    return this.getAdminReport('revenue-source', params);
  }

  getShipmentSummary(params: any = {}): Observable<any> {
    return this.getAdminReport('shipment-summary', params);
  }

  getShipmentTrend(params: any = {}): Observable<any> {
    return this.getAdminReport('shipment-trend', params);
  }

  getShipmentStatus(params: any = {}): Observable<any> {
    return this.getAdminReport('shipment-status', params);
  }

  getTopMerchantsByShipments(params: any = {}): Observable<any> {
    return this.getAdminReport('top-merchants-by-shipments', params);
  }

  private getAdminReport(endpoint: string, params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<any>(`${this.baseUrl}/reports/${endpoint}`, { params: httpParams });
  }
}
