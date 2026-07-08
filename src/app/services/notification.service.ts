import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  /** GET /notifications */
  listNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Observable<any> {
    let p = new HttpParams();
    if (params.page)  p = p.set('page',  params.page.toString());
    if (params.limit) p = p.set('limit', params.limit.toString());
    if (params.unreadOnly) p = p.set('unreadOnly', 'true');
    return this.http.get<any>(`${this.baseUrl}/notifications`, { params: p });
  }

  /** PATCH /notifications/mark-read  — mark all as read */
  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/mark-read`, {});
  }

  /** PATCH /notifications/:id/read  — mark single as read */
  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  /** DELETE /notifications/:id */
  deleteNotification(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/notifications/${id}`);
  }

  /** POST /notifications/queries — raise a query alert */
  raiseQuery(data: { subject: string; message: string; orderId?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/queries`, data);
  }
}
