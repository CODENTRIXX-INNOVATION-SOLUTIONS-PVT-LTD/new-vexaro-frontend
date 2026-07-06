import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DisputeService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? '/api/v1';
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

  resolveWeightDispute(id: string, status: 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CLOSED'): Observable<any> {
    const payloadStatus = status === 'APPROVED' ? 'RESOLVED' : status === 'REJECTED' ? 'CLOSED' : status;
    return this.http.patch<any>(`${this.baseUrl}/disputes/weight-dispute/${id}/resolve`, { status: payloadStatus });
  }

  submitProof(id: string, proofImages: string[]): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/disputes/weight-dispute/${id}/proof`, { proofImages });
  }

  /**
   * Add a comment/reply to a dispute.
   * The disputes module uses PATCH /:id with a "comment" field —
   * there is no separate /reply route (unlike support tickets).
   */
  addComment(id: string, message: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/disputes/${id}`, { comment: message });
  }
}
