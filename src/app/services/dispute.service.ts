import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  listDisputes(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<any>(`${this.baseUrl}/disputes`, { params: httpParams });
  }

  getDisputeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/disputes/${id}`);
  }

  createDispute(payload: {
    shipmentId: string;
    category: string;
    description: string;
    attachments?: { url: string; name: string }[];
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/disputes`, payload);
  }

  resolveWeightDispute(id: string, status: 'APPROVED' | 'REJECTED'): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/disputes/${id}`, { status });
  }

  submitProof(id: string, proofImages: string[]): Observable<any> {
    // Calls the submit proof endpoint
    return this.http.patch<any>(`${this.baseUrl}/disputes/${id}/proof`, { proofImages });
  }

  addComment(id: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/disputes/${id}/reply`, { comment });
  }
}
