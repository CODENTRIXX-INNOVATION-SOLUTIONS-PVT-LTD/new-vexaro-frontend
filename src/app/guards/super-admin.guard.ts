import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');

  if (token && role === 'SUPER_ADMIN') {
    return true;
  }

  // Redirect to login if token or matching userRole is absent
  return router.parseUrl('/login');
};
