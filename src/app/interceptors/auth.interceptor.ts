import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';

// ── Shared refresh state ──────────────────────────────────────────────────────
// These live outside the interceptor function so they are module-level singletons.
// When multiple requests get a 401 simultaneously, only ONE refresh call is made.
// All other requests wait on the same Observable via the BehaviorSubject.
let isRefreshing = false;
const refreshToken$ = new BehaviorSubject<string | null>(null);

/** Reads the access token from whichever storage it was placed in. */
function getStoredToken(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

/** Wipes all auth keys from both storage layers. */
function clearAuthStorage(): void {
  const keys = ['accessToken', 'refreshToken', 'userRole', 'user', 'redirectTo'];
  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

/**
 * Revokes the refresh token server-side (best-effort), clears local storage,
 * and redirects to /login.
 */
function clearAuthAndRedirect(
  http: HttpClient,
  router: Router,
  baseUrl: string,
): Observable<never> {
  const refreshToken = getStoredToken('refreshToken');

  isRefreshing = false;
  refreshToken$.next(null);
  clearAuthStorage();
  router.navigate(['/login']);

  // Fire-and-forget: revoke the token server-side so it can't be reused.
  // We don't block on this — the user is already being logged out locally.
  if (refreshToken) {
    http
      .post(
        `${baseUrl}/auth/logout`,
        { refreshToken },
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) },
      )
      .subscribe({ error: () => { /* ignore — local logout already done */ } });
  }

  return throwError(() => new Error('Session expired. Please log in again.'));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http   = inject(HttpClient);
  const router = inject(Router);

  const baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  // Attach token to every non-auth request (check both storage layers)
  const token   = getStoredToken('accessToken');
  const authReq = token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 on protected endpoints
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      const storedRefresh = getStoredToken('refreshToken');
      if (!storedRefresh) {
        return clearAuthAndRedirect(http, router, baseUrl);
      }

      // ── If a refresh is already in-flight, queue this request ────────────
      if (isRefreshing) {
        return refreshToken$.pipe(
          // Wait until the refresh completes (emits a non-null token)
          filter((t): t is string => t !== null),
          take(1),
          switchMap((newToken) => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retried);
          }),
        );
      }

      // ── First request to hit 401 — start the refresh ──────────────────────
      isRefreshing = true;
      refreshToken$.next(null); // signal "refresh in progress" to queued requests

      return http
        .post<any>(
          `${baseUrl}/auth/refresh`,
          { refreshToken: storedRefresh },
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) },
        )
        .pipe(
          switchMap((response) => {
            const newAccessToken  = response?.data?.accessToken;
            const newRefreshToken = response?.data?.refreshToken;

            if (!newAccessToken || !newRefreshToken) {
              return clearAuthAndRedirect(http, router, baseUrl);
            }

            // Persist to whichever storage the original tokens were in
            const storage = localStorage.getItem('accessToken') !== null
              ? localStorage
              : sessionStorage;
            storage.setItem('accessToken',  newAccessToken);
            storage.setItem('refreshToken', newRefreshToken);

            // Unblock all queued requests with the new token
            isRefreshing = false;
            refreshToken$.next(newAccessToken);

            // Retry the original request that triggered the 401
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            });
            return next(retried);
          }),
          catchError(() => clearAuthAndRedirect(http, router, baseUrl)),
        );
    }),
  );
};
