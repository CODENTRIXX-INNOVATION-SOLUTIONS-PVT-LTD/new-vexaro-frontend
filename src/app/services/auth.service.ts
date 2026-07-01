import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Centralised service for authentication‑related API calls.
 * Example usage:
 *   this.authService.changeInitialCredentials(email, password).subscribe(...);
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL can be overridden via a global __env variable (set in index.html) or fallback to localhost.
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  private readonly jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  /**
   * POST /auth/change-initial-credentials
   * Payload: { email: string; password: string }
   */
  changeInitialCredentials(email: string, password: string): Observable<any> {
    const payload = { email, password };
    return this.http.post(`${this.baseUrl}/auth/change-initial-credentials`, payload, {
      headers: this.jsonHeaders,
    });
  }

  /**
   * POST /auth/login – placeholder for future login integration.
   */
  login(email: string, password: string): Observable<any> {
    console.log(this.baseUrl);
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }, { headers: this.jsonHeaders });
  }

  /**
   * POST /auth/set-password – used by the invite flow (change-credentials / register).
   */
  setPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/set-password`,
      { token, password: newPassword },
      { headers: this.jsonHeaders }
    );
  }

  /**
   * POST /auth/forgot-password
   * Triggers a password-reset email.
   * Payload: { email: string }
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/forgot-password`,
      { email },
      { headers: this.jsonHeaders }
    );
  }

  /**
   * POST /auth/reset-password
   * Submits the new password together with the reset token from the email link.
   * Payload: { token: string; password: string }
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/reset-password`,
      { token, password: newPassword },
      { headers: this.jsonHeaders }
    );
  }

  /**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 */
  getMe(): Observable<any> {
    const token = localStorage.getItem('accessToken');

    return this.http.get(`${this.baseUrl}/auth/me`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  /**
   * GET /auth/verify-invite?token=<token>
   * Verifies the invite token and returns the user's details.
   */
  verifyInvite(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/verify-invite?token=${token}`);
  }
}
