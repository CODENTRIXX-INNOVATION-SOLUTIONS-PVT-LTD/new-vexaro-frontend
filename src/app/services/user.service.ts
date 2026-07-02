import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  WarehouseChangeRequestParams, 
  WarehouseChangeRequestResponse,
  WarehouseActionResponse 
} from '../models/warehouse-change-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  private readonly jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  listUsers(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.role) httpParams = httpParams.set('role', params.role);
    return this.http.get(`${this.baseUrl}/users`, { params: httpParams });
  }

  inviteUser(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/invite`, payload, {
      headers: this.jsonHeaders,
    });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}`, payload, {
      headers: this.jsonHeaders,
    });
  }

  // Warehouse Change Request methods
  getWarehouseChangeRequests(params: WarehouseChangeRequestParams = {}): Observable<WarehouseChangeRequestResponse> {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<WarehouseChangeRequestResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests`,
      { params: httpParams }
    ).pipe(
      catchError(this.handleError('getWarehouseChangeRequests'))
    );
  }

  approveWarehouseChangeRequest(requestId: string, payload: any = {}): Observable<WarehouseActionResponse> {
    if (!requestId || requestId.trim() === '') {
      return throwError(() => new Error('Request ID is required'));
    }

    return this.http.post<WarehouseActionResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests/${requestId}/approve`,
      payload,
      { headers: this.jsonHeaders }
    ).pipe(
      catchError(this.handleError('approveWarehouseChangeRequest'))
    );
  }

  rejectWarehouseChangeRequest(requestId: string, payload: { reason: string }): Observable<WarehouseActionResponse> {
    if (!requestId || requestId.trim() === '') {
      return throwError(() => new Error('Request ID is required'));
    }
    
    if (!payload.reason || payload.reason.trim() === '') {
      return throwError(() => new Error('Rejection reason is required'));
    }

    return this.http.post<WarehouseActionResponse>(
      `${this.baseUrl}/users/distributor/warehouse-change-requests/${requestId}/reject`,
      payload,
      { headers: this.jsonHeaders }
    ).pipe(
      catchError(this.handleError('rejectWarehouseChangeRequest'))
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
      if (error.status === 409) {
        return throwError(() => new Error('This request has already been processed.'));
      }
      if (error.status >= 500) {
        return throwError(() => new Error('Server error. Please try again later.'));
      }

      const errorMessage = error.error?.message || error.message || 'An unexpected error occurred.';
      return throwError(() => new Error(errorMessage));
    };
  }
}
