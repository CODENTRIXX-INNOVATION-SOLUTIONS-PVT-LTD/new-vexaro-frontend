import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Centralised service for authentication-related API calls.
 * The authInterceptor (registered globally in app.config.ts) automatically
 * attaches the Bearer token to every non-auth request, so individual methods
 * here do NOT need to read localStorage themselves.
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
   * POST /auth/login
   * Payload: { email: string; password: string }
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }, { headers: this.jsonHeaders });
  }

  /**
   * POST /auth/logout
   * Revokes the refresh token server-side.
   * Payload: { refreshToken: string }
   */
  logout(refreshToken: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/logout`,
      { refreshToken },
      { headers: this.jsonHeaders },
    );
  }

  /**
   * POST /auth/change-initial-credentials
   * Called after first login when mustChangeCredentials is true.
   * Requires a valid access token (injected by the interceptor).
   * Payload: { newEmail: string; newPassword: string }
   */
  changeInitialCredentials(newEmail: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/change-initial-credentials`,
      { newEmail, newPassword },
      { headers: this.jsonHeaders },
    );
  }

  /**
   * POST /auth/set-password – used by the invite flow (register / set-password pages).
   * Payload: { token: string; password: string }
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
   * The Bearer token is attached automatically by the authInterceptor.
   */
  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`);
  }

  /**
   * GET /auth/verify-invite?token=<token>
   * Verifies the invite token and returns the user's details.
   */
  verifyInvite(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/verify-invite`, {
      params: { token },
    });
  }
}
