import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

/**
 * Generic "is logged in" guard.
 * Allows access when an accessToken exists in either storage layer
 * (localStorage for remembered sessions, sessionStorage for session-only).
 * Redirects to /login otherwise.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken');

  if (token) {
    return true;
  }

  return router.parseUrl('/login');
};
