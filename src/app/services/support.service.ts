import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  getTickets(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<any>(`${this.baseUrl}/support`, { params: httpParams });
  }

  getTicketById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/support/${id}`);
  }

  createTicket(payload: {
    subject: string;
    category: string;
    priority: string;
    description: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/support`, payload);
  }

  updateTicket(id: string, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/support/${id}`, payload);
  }

  addReply(id: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/support/${id}/reply`, { comment });
  }

  uploadAttachment(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/support/upload`, formData);
  }
}
