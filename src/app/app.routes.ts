import { Routes } from '@angular/router';
import { SuperAdminDashboard } from './dashboards/super-admin-dashboard/super-admin-dashboard';
import { MerchantDashboard } from './dashboards/merchant-dashboard/merchant-dashboard';
import { DistributorDashboard } from './dashboards/distributor-dashboard/distributor-dashboard';
import { WarehouseDashboard } from './dashboards/warehouse-dashboard/warehouse-dashboard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// SUPER-ADMIN
import { SuperAdminDashboardPage } from './pages/super-admin/dashboard/SuperAdminDashboardPage';
import { Merchant } from './pages/super-admin/merchant/merchant-list/merchant-list';
import { DistributorList } from './pages/super-admin/distributor/distributor-list/distributor-list';
import { Warehouses } from './pages/super-admin/warehouses/warehouses';
import { Shipments } from './pages/super-admin/shipments/shipments';
import { Tracking } from './pages/super-admin/tracking/tracking';
import { RateManagement } from './pages/super-admin/rate-management/rate-management';
import { AdminReports } from './pages/super-admin/admin-reports/admin-reports';
import { UserManagement } from './pages/super-admin/user-management/user-management';
import { AdminSetting } from './pages/super-admin/admin-setting/admin-setting';
import { AdminPayment } from './pages/super-admin/admin-payment/admin-payment';

// WAREHOUSE
import { InboundShipments } from './pages/warehouse/inbound-shipments/inbound-shipments';
import { OutboundShipments } from './pages/warehouse/outbound-shipments/outbound-shipments';
import { Inventory } from './pages/warehouse/inventory/inventory';
import { ScanReceive } from './pages/warehouse/scan-receive/scan-receive';
import { ScanDispatch } from './pages/warehouse/scan-dispatch/scan-dispatch';
import { Support } from './pages/warehouse/support/support';
import { WarehouseDashboardPage } from './pages/warehouse/dashboard/dashboard';

//  DISTRIBUTOR
import { Deliveries } from './pages/distributor/deliveries/deliveries';
import { DAssignDelivery } from './pages/distributor/assign-delivery/assign-delivery';
import { Pickups } from './pages/distributor/pickups/pickups';
import { FailedDeliveries } from './pages/distributor/failed-deliveries/failed-deliveries';
import { Drivers } from './pages/distributor/drivers/drivers';
import { CreateShipment } from './pages/merchant/create-shipment/create-shipment';
import { DistrubuterDashboardPage } from './pages/distributor/dashboard/DistrubuterDashboardPage';

// MARCHAND
import { BulkUpload } from './pages/merchant/bulk-upload/bulk-upload';
import { Payments } from './pages/merchant/payments/payments';
import { AddressBook } from './pages/merchant/address-book/address-book';
import { MarchandeDashboardPage } from './pages/merchant/dashboard/dashboard';
import { DistributorProfile } from './pages/super-admin/distributor/distributor-profile/distributor-profile';
import { Reports } from './pages/merchant/reports/reports';
import { MerchantProfile } from './pages/super-admin/merchant/merchant-profile/merchant-profile';
import { MerchantTracking } from './pages/merchant/merchant-tracking/merchant-tracking';
import { DistributorShipment } from './pages/distributor/distributor-shipment/distributor-shipment';



export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'super-admin', component: SuperAdminDashboard,
    children: [
      { path: 'dashboard', component: SuperAdminDashboardPage },
      { path: 'merchants', component: Merchant },
      { path: 'distributors', component: DistributorList },
      { path: 'distributors/profile/:id', component: DistributorProfile },
      { path: 'warehouses', component: Warehouses },
      { path: 'shipments', component: Shipments },
      { path: 'tracking', component: Tracking },
      { path: 'rate-management', component: RateManagement },
      { path: 'merchants/profile/:id', component: MerchantProfile },
      { path: 'payments', component: AdminPayment },
      { path: 'reports', component: AdminReports },
      { path: 'user-management', component: UserManagement },
      { path: 'settings', component: AdminSetting },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'merchant',
    component: MerchantDashboard,
    children: [
      { path: 'dashboard', component: MarchandeDashboardPage },
      { path: 'shipments', component: Shipments },
      { path: 'tracking', component: Tracking },
      { path: 'create-shipment', component: CreateShipment },
      { path: 'bulk-upload', component: BulkUpload },
      { path: 'payments', component: Payments },
      { path: 'reports', component: Reports },
      { path: 'tracking', component: MerchantTracking },
      { path: 'address-book', component: AddressBook },
      { path: 'support', component: Support },
      { path: 'merchants/profile/:id', component: MerchantProfile },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'distributor',
    component: DistributorDashboard,
    children: [
      { path: 'dashboard', component: DistrubuterDashboardPage },
      { path: 'deliveries', component: Deliveries },
      { path: 'assign-delivery', component: DAssignDelivery },
      { path: 'pickups', component: Pickups },
      { path: 'shipments', component: DistributorShipment },

      { path: 'tracking', component: Tracking },

      { path: 'failed-deliveries', component: FailedDeliveries },
      { path: 'reports', component: Reports },
      { path: 'drivers', component: Drivers },
      { path: 'support', component: Support },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'warehouse',
    component: WarehouseDashboard,
    children: [
      { path: 'dashboard', component: WarehouseDashboardPage },
      { path: 'inbound-shipments', component: InboundShipments },
      { path: 'outbound-shipments', component: OutboundShipments },
      { path: 'inventory', component: Inventory },
      { path: 'scan-receive', component: ScanReceive },
      { path: 'scan-dispatch', component: ScanDispatch },
      { path: 'reports', component: Reports },
      { path: 'support', component: Support },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];