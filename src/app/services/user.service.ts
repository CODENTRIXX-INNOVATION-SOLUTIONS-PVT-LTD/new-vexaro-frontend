import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  deactivateUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  reactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/reactivate`, {}, {
      headers: this.jsonHeaders,
    });
  }

  inviteUser(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/invite`, payload, {
      headers: this.jsonHeaders,
    });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }
}
