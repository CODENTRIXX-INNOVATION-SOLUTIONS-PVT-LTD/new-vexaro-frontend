import { Routes } from '@angular/router';
import { SuperAdminDashboard } from './dashboards/super-admin-dashboard/super-admin-dashboard';
import { MerchantDashboard } from './dashboards/merchant-dashboard/merchant-dashboard';
import { DistributorDashboard } from './dashboards/distributor-dashboard/distributor-dashboard';
import { WarehouseDashboard } from './dashboards/warehouse-dashboard/warehouse-dashboard';
import { LoginComponent } from './login/login.component';

// SUPER-ADMIN
import { Dashboard } from './pages/super-admin/dashboard/dashboard';
import { Merchants } from './pages/super-admin/merchants/merchants';
import { Distributors } from './pages/super-admin/distributors/distributors';
import { Warehouses } from './pages/super-admin/warehouses/warehouses';
import { Shipments } from './pages/super-admin/shipments/shipments';
import { Tracking } from './pages/super-admin/tracking/tracking';
import { RateManagement } from './pages/super-admin/rate-management/rate-management';
import { Reports } from './pages/super-admin/reports/reports';
import { UserManagement } from './pages/super-admin/user-management/user-management';
import { Setting } from './pages/super-admin/setting/setting';

// WAREHOUSE
import { InboundShipments } from './pages/warehouse/inbound-shipments/inbound-shipments';
import { OutboundShipments } from './pages/warehouse/outbound-shipments/outbound-shipments';
import { Inventory } from './pages/warehouse/inventory/inventory';
import { ScanReceive } from './pages/warehouse/scan-receive/scan-receive';
import { ScanDispatch } from './pages/warehouse/scan-dispatch/scan-dispatch';
import { Support } from './pages/warehouse/support/support';

//  DISTRIBUTOR
import { Deliveries } from './pages/distributor/deliveries/deliveries';
import { AssignDelivery } from './pages/distributor/assign-delivery/assign-delivery';
import { Pickups } from './pages/distributor/pickups/pickups';
import { FailedDeliveries } from './pages/distributor/failed-deliveries/failed-deliveries';
import { Drivers } from './pages/distributor/drivers/drivers';
import { CreateShipment } from './pages/merchant/create-shipment/create-shipment';

// MARCHAND
import { BulkUpload } from './pages/merchant/bulk-upload/bulk-upload';
import { Payments } from './pages/merchant/payments/payments';
import { AddressBook } from './pages/merchant/address-book/address-book';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'super-admin',
    component: SuperAdminDashboard,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'merchants', component: Merchants },
      { path: 'distributors', component: Distributors },
      { path: 'warehouses', component: Warehouses },
      { path: 'shipments', component: Shipments },
      { path: 'tracking', component: Tracking },
      { path: 'rate-management', component: RateManagement },
      { path: 'payments', component: PaymentResponse },
      { path: 'reports', component: Reports },
      { path: 'user-management', component: UserManagement },
      { path: 'settings', component: Setting },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'merchant',
    component: MerchantDashboard,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'shipments', component: Shipments },
      { path: 'create-shipment', component: CreateShipment },
      { path: 'bulk-upload', component: BulkUpload },
      { path: 'payments', component: Payments },
      { path: 'reports', component: Reports },
      { path: 'address-book', component: AddressBook },
      { path: 'support', component: Support },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'distributor',
    component: DistributorDashboard,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'deliveries', component: Deliveries },
      { path: 'assign-delivery', component: AssignDelivery },
      { path: 'pickups', component: Pickups },
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
      { path: 'dashboard', component: Dashboard },
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