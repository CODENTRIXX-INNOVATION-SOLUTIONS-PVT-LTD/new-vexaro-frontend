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
import { AllShipments } from './pages/distributor/all-shipments/all-shipments';
import { CodManagement } from './pages/distributor/finance/cod-management/cod-management';
import { Wallet } from './pages/distributor/finance/wallet/wallet';
import { Transactions } from './pages/distributor/finance/transactions/transactions';
import { Settlements } from './pages/distributor/finance/settlements/settlements';
import { ShipmentReports } from './pages/distributor/reports/shipment-reports/shipment-reports';

// NEW DISTRIBUTOR MODULES
import { DistributorMerchantList } from './pages/distributor/merchants/merchant-list/merchant-list';
import { CreateMerchant } from './pages/distributor/merchants/create-merchant/create-merchant';
import { DistributorMerchantProfile } from './pages/distributor/merchants/merchant-profile/merchant-profile';
import { AllMerchantWallets } from './pages/distributor/merchant-finance/all-merchant-wallets/all-merchant-wallets';
import { TopupMerchantWallet } from './pages/distributor/merchant-finance/topup-merchant-wallet/topup-merchant-wallet';
import { RateCards } from './pages/distributor/rate-margin/rate-cards/rate-cards';
import { MarginConfig } from './pages/distributor/rate-margin/margin-config/margin-config';
import { ProfitView } from './pages/distributor/rate-margin/profit-view/profit-view';
import { DisputeList } from './pages/distributor/disputes/dispute-list/dispute-list';
import { DisputeDetail } from './pages/distributor/disputes/dispute-detail/dispute-detail';
import { MerchantRevenueReport } from './pages/distributor/reports/merchant-revenue/merchant-revenue';
import { ProfitReport } from './pages/distributor/reports/profit-report/profit-report';
import { DisputeReport } from './pages/distributor/reports/dispute-report/dispute-report';
import { PerformanceAnalytics } from './pages/distributor/reports/performance-analytics/performance-analytics';
import { Tickets } from './pages/distributor/support/tickets/tickets';
import { CreateTicket } from './pages/distributor/support/create-ticket/create-ticket';
import { Faqs } from './pages/distributor/support/faqs/faqs';
import { ProfileSettings } from './pages/distributor/settings/profile/profile';
import { CompanyDetails } from './pages/distributor/settings/company-details/company-details';
import { NotificationsSettings } from './pages/distributor/settings/notifications/notifications';
import { SecuritySettings } from './pages/distributor/settings/security/security';
import { ApiSettings } from './pages/distributor/settings/api-settings/api-settings';
import { CreateShipment } from './pages/merchant/create-shipment/create-shipment';
import { DistrubuterDashboardPage } from './pages/distributor/dashboard/DistrubuterDashboardPage';
import { LiveTracking } from './pages/distributor/tracking/live-tracking/live-tracking';
import { TrackingHistory } from './pages/distributor/tracking/tracking-history/tracking-history';
import { AwbSearch } from './pages/distributor/tracking/awb-search/awb-search';

// MARCHAND
import { BulkUpload } from './pages/merchant/bulk-upload/bulk-upload';
import { Payments } from './pages/merchant/payments/payments';
import { AddressBook } from './pages/merchant/address-book/address-book';
import { MarchandeDashboardPage } from './pages/merchant/dashboard/dashboard';
import { DistributorProfile } from './pages/super-admin/distributor/distributor-profile/distributor-profile';
import { Reports } from './pages/merchant/reports/reports';
import { MerchantProfile } from './pages/super-admin/merchant/merchant-profile/merchant-profile';
import { MerchantTracking } from './pages/merchant/merchant-tracking/merchant-tracking';



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
      // { path: 'tracking', component: Tracking },
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

      // Merchants
      { path: 'merchants', component: DistributorMerchantList },
      { path: 'merchants/create', component: CreateMerchant },
      { path: 'merchants/:id', component: DistributorMerchantProfile },
      // Note: merchants/:id/wallet and merchants/:id/shipments can use the MerchantProfile component with activeTab set

      // Operations
      { path: 'operations/shipments', component: AllShipments },
      { path: 'operations', redirectTo: 'operations/shipments', pathMatch: 'full' },

      // Tracking
      { path: 'tracking/live', component: LiveTracking },
      { path: 'tracking/history', component: TrackingHistory },
      { path: 'tracking/search', component: AwbSearch },
      { path: 'tracking', redirectTo: 'tracking/live', pathMatch: 'full' },
      
      // Merchant Finance
      { path: 'merchant-finance/wallets', component: AllMerchantWallets },
      { path: 'merchant-finance/topup', component: TopupMerchantWallet },
      { path: 'merchant-finance/transactions', component: Transactions }, // Reuse transactions for now
      
      // My Finance
      { path: 'finance/cod-management', component: CodManagement },
      { path: 'finance/wallet', component: Wallet },
      { path: 'finance/transactions', component: Transactions },
      { path: 'finance/settlements', component: Settlements },
      { path: 'finance', redirectTo: 'finance/wallet', pathMatch: 'full' },

      // Rate & Margin
      { path: 'rate-margin/rate-cards', component: RateCards },
      { path: 'rate-margin/margins', component: MarginConfig },
      { path: 'rate-margin/profit', component: ProfitView },

      // Disputes
      { path: 'disputes', component: DisputeList },
      { path: 'disputes/:id', component: DisputeDetail },

      // Reports
      { path: 'reports/shipment-reports', component: ShipmentReports },
      { path: 'reports/merchant-revenue', component: MerchantRevenueReport },
      { path: 'reports/profit', component: ProfitReport },
      { path: 'reports/disputes', component: DisputeReport },
      { path: 'reports/performance-analytics', component: PerformanceAnalytics },
      { path: 'reports', redirectTo: 'reports/shipment-reports', pathMatch: 'full' },

      // Support
      { path: 'support/tickets', component: Tickets },
      { path: 'support/create-ticket', component: CreateTicket },
      { path: 'support/faqs', component: Faqs },
      { path: 'support', redirectTo: 'support/faqs', pathMatch: 'full' },

      // Settings
      { path: 'settings/profile', component: ProfileSettings },
      { path: 'settings/company-details', component: CompanyDetails },
      { path: 'settings/notifications', component: NotificationsSettings },
      { path: 'settings/security', component: SecuritySettings },
      { path: 'settings/api-settings', component: ApiSettings },
      { path: 'settings', redirectTo: 'settings/profile', pathMatch: 'full' },
      
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