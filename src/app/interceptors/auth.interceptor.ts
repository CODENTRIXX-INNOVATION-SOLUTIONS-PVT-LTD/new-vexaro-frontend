import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const http = inject(HttpClient);
    const router = inject(Router);
    const baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
    const token = localStorage.getItem('accessToken');

    const authReq = token ? req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    }) : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const refreshToken = localStorage.getItem('refreshToken');
            const isAuthEndpoint = req.url.includes('/auth/login') ||
                req.url.includes('/auth/refresh') ||
                req.url.includes('/auth/logout');

            if (error.status !== 401 || !refreshToken || isAuthEndpoint) {
                return throwError(() => error);
            }

            return http.post<any>(
                `${baseUrl}/auth/refresh`,
                { refreshToken },
                { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
            ).pipe(
                switchMap((response) => {
                    const newAccessToken = response?.data?.accessToken;
                    const newRefreshToken = response?.data?.refreshToken;

                    if (!newAccessToken || !newRefreshToken) {
                        return throwError(() => error);
                    }

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    const retryReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                    });

                    return next(retryReq);
                }),
                catchError((refreshError) => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('user');
                    localStorage.removeItem('redirectTo');
                    router.navigate(['/login']);
                    return throwError(() => refreshError);
                })
            );
        })
    );
};
