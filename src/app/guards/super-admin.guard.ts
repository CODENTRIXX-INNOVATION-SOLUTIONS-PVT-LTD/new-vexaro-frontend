import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
  const role  = localStorage.getItem('userRole')    ?? sessionStorage.getItem('userRole');

  if (token && role === 'SUPER_ADMIN') {
    return true;
  }

  return router.parseUrl('/login');
};
