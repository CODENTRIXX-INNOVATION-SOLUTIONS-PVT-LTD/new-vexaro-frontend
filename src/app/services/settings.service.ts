import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/change-password`, payload);
  }

  getNotificationPrefs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/notifications`);
  }

  updateNotificationPrefs(payload: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/settings/notifications`, payload);
  }

  getApiKeys(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/api-keys`);
  }

  createApiKey(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/api-keys`, payload);
  }

  revokeApiKey(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/settings/api-keys/${id}`);
  }
}
