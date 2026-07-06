import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  listTickets(params: any = {}): Observable<any> {
    let p = new HttpParams();
    if (params.page)   p = p.set('page',   params.page.toString());
    if (params.limit)  p = p.set('limit',  params.limit.toString());
    if (params.status) p = p.set('status', params.status);
    return this.http.get<any>(`${this.baseUrl}/support`, { params: p });
  }

  getTicketById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/support/${id}`);
  }

  createTicket(payload: {
    subject: string;
    category: string;
    priority: string;
    description: string;
    attachments?: any[];
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/support`, payload);
  }

  addReply(id: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/support/${id}/reply`, { message });
  }

  uploadAttachment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/support/upload`, formData);
  }
}
