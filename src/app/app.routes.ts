import { Routes } from '@angular/router';
import { SuperAdminDashboard } from './dashboards/super-admin-dashboard/super-admin-dashboard';
import { MerchantDashboard } from './dashboards/merchant-dashboard/merchant-dashboard';
import { DistributorDashboard } from './dashboards/distributor-dashboard/distributor-dashboard';
import { WarehouseDashboard } from './dashboards/warehouse-dashboard/warehouse-dashboard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'super-admin',
    component: SuperAdminDashboard
  },
  {
    path: 'merchant',
    component: MerchantDashboard
  },
  {
    path: 'distributor',
    component: DistributorDashboard
  },
  {
    path: 'warehouse',
    component: WarehouseDashboard
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];