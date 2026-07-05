import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const distributorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
  const role  = localStorage.getItem('userRole')    ?? sessionStorage.getItem('userRole');

  if (token && role === 'DISTRIBUTOR') {
    return true;
  }

  return router.parseUrl('/login');
};
