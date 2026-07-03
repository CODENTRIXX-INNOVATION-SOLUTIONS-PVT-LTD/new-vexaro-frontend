import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformSettings {
  companyName: string;
  logo: string;
  gstNumber: string;
  address: string;
  supportEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformSettingsService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  getPlatformSettings(): Observable<{ data: PlatformSettings }> {
    return this.http.get<{ data: PlatformSettings }>(`${this.baseUrl}/platform-settings`);
  }

  updatePlatformSettings(settings: PlatformSettings): Observable<{ data: PlatformSettings }> {
    return this.http.patch<{ data: PlatformSettings }>(`${this.baseUrl}/platform-settings`, settings);
  }
}
