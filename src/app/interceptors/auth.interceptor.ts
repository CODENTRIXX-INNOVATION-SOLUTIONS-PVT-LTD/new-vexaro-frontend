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

function clearAuthAndRedirect(router: Router): Observable<never> {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('user');
  localStorage.removeItem('redirectTo');
  isRefreshing = false;
  refreshToken$.next(null);
  router.navigate(['/login']);
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

  // Attach token to every non-auth request
  const token    = localStorage.getItem('accessToken');
  const authReq  = token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 on protected endpoints
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      const storedRefresh = localStorage.getItem('refreshToken');
      if (!storedRefresh) {
        return clearAuthAndRedirect(router);
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
              return clearAuthAndRedirect(router);
            }

            localStorage.setItem('accessToken',  newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Unblock all queued requests with the new token
            isRefreshing = false;
            refreshToken$.next(newAccessToken);

            // Retry the original request that triggered the 401
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            });
            return next(retried);
          }),
          catchError((refreshError) => {
            return clearAuthAndRedirect(router);
          }),
        );
    }),
  );
};
