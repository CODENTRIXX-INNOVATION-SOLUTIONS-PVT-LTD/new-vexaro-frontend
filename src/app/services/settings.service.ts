import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  /** GET /settings/profile */
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/profile`);
  }

  /** PATCH /settings/profile */
  updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyName?: string;
    address?: string;
  }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/settings/profile`, payload);
  }

  /** POST /settings/change-password */
  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/change-password`, payload);
  }

  /** GET /settings/api-keys */
  getApiKeys(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/settings/api-keys`);
  }

  /** POST /settings/api-keys */
  createApiKey(payload: { name: string; permissions?: string[] }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/settings/api-keys`, payload);
  }

  /** DELETE /settings/api-keys/:id */
  revokeApiKey(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/settings/api-keys/${id}`);
  }
}
