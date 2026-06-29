import { Routes } from "@angular/router";
import { SuperAdminDashboard } from "./dashboards/super-admin-dashboard/super-admin-dashboard";
import { MerchantDashboard } from "./dashboards/merchant-dashboard/merchant-dashboard";
import { DistributorDashboard } from "./dashboards/distributor-dashboard/distributor-dashboard";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { Home } from "./home/home";
import { ChangeCredentialsComponent } from "./change-credentials/change-credentials.component";

// SUPER-ADMIN
import { SuperAdminDashboardPage } from "./pages/super-admin/dashboard/SuperAdminDashboardPage";
import { Merchant } from "./pages/super-admin/merchant/merchant-list/merchant-list";
import { DistributorList } from "./pages/super-admin/distributor/distributor-list/distributor-list";
import { Shipments } from "./pages/super-admin/shipments/shipments";
import { Tracking } from "./pages/super-admin/tracking/tracking";
import { RateManagement } from "./pages/super-admin/rate-management/rate-management";
import { AdminReports } from "./pages/super-admin/admin-reports/admin-reports";
import { UserManagement } from "./pages/super-admin/user-management/user-management";
import { AdminSetting } from "./pages/super-admin/admin-setting/admin-setting";
import { AdminPayment } from "./pages/super-admin/admin-payment/admin-payment";
import { AdminDisputeList } from "./pages/super-admin/disputes/dispute-list/dispute-list";

// DISTRIBUTOR
import { DistrubuterDashboardPage } from "./pages/distributor/dashboard/DistrubuterDashboardPage";
import { DistributorMerchantList } from "./pages/distributor/merchants/merchant-list/merchant-list";
import { CreateMerchant } from "./pages/distributor/merchants/create-merchant/create-merchant";
import { DistributorMerchantProfile } from "./pages/distributor/merchants/merchant-profile/merchant-profile";

import { LiveTracking } from "./pages/distributor/tracking/live-tracking/live-tracking";
import { TrackingHistory } from "./pages/distributor/tracking/tracking-history/tracking-history";
import { AwbSearch } from "./pages/distributor/tracking/awb-search/awb-search";

import { DistributorWallet } from "./pages/distributor/wallet/wallet";

import { AllShipments } from "./pages/distributor/all-shipments/all-shipments";
import { CodManagement } from "./pages/distributor/finance/cod-management/cod-management";
import { Wallet } from "./pages/distributor/finance/wallet/wallet";
import { Transactions } from "./pages/distributor/finance/transactions/transactions";
import { Settlements } from "./pages/distributor/finance/settlements/settlements";

import { AllMerchantWallets } from "./pages/distributor/merchant-finance/all-merchant-wallets/all-merchant-wallets";
import { TopupMerchantWallet } from "./pages/distributor/merchant-finance/topup-merchant-wallet/topup-merchant-wallet";

import { RateCards } from "./pages/distributor/rate-margin/rate-cards/rate-cards";
import { MarginConfig } from "./pages/distributor/rate-margin/margin-config/margin-config";
import { ProfitView } from "./pages/distributor/rate-margin/profit-view/profit-view";

import { DisputeList } from "./pages/distributor/disputes/dispute-list/dispute-list";
import { DisputeDetail } from "./pages/distributor/disputes/dispute-detail/dispute-detail";

import { ShipmentReports } from "./pages/distributor/reports/shipment-reports/shipment-reports";
import { MerchantRevenueReport } from "./pages/distributor/reports/merchant-revenue/merchant-revenue";
import { ProfitReport } from "./pages/distributor/reports/profit-report/profit-report";
import { DisputeReport } from "./pages/distributor/reports/dispute-report/dispute-report";
import { PerformanceAnalytics } from "./pages/distributor/reports/performance-analytics/performance-analytics";

import { Tickets } from "./pages/distributor/support/tickets/tickets";
import { CreateTicket } from "./pages/distributor/support/create-ticket/create-ticket";
import { Faqs } from "./pages/distributor/support/faqs/faqs";

import { ProfileSettings } from "./pages/distributor/settings/profile/profile";
import { CompanyDetails } from "./pages/distributor/settings/company-details/company-details";
import { NotificationsSettings } from "./pages/distributor/settings/notifications/notifications";
import { SecuritySettings } from "./pages/distributor/settings/security/security";
import { ApiSettings } from "./pages/distributor/settings/api-settings/api-settings";

import { CreateShipment } from "./pages/merchant/create-shipment/create-shipment";
import { MerchantDisputesComponent } from "./pages/merchant/disputes/disputes";

// MARCHANT
import { BulkUpload } from "./pages/merchant/bulk-upload/bulk-upload";
import { Payments } from "./pages/merchant/payments/payments";
import { AddressBook } from "./pages/merchant/address-book/address-book";
import { MarchandeDashboardPage } from "./pages/merchant/dashboard/dashboard";
import { MerchantTracking } from "./pages/merchant/merchant-tracking/merchant-tracking";

import { MerchantSupport } from "./pages/merchant/merchant-support/merchant-support";
import { MerchantShipments } from "./pages/merchant/shipments/merchant-shipments";
import { MerchantProfilePage } from "./pages/merchant/merchant-profile-page/merchant-profile-page";
import { MerchantWarehouse } from "./pages/merchant/merchant-warehouse/merchant-warehouse";
import { MerchantProfile } from "./pages/super-admin/merchant/merchant-profile/merchant-profile";

import { DistributorProfile } from "./pages/super-admin/distributor/distributor-profile/distributor-profile";

import { Reports } from "./pages/merchant/reports/reports";

import { superAdminGuard } from "./guards/super-admin.guard";
import { distributorGuard } from "./guards/distributor.guard";
import { merchantGuard } from "./guards/merchant.guard";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: "reset-password",
    loadComponent: () =>
      import("./reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: "404",
    loadComponent: () =>
      import("./error-pages/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: "403",
    loadComponent: () =>
      import("./error-pages/forbidden/forbidden.component").then(
        (m) => m.ForbiddenComponent,
      ),
  },
  {
    path: "500",
    loadComponent: () =>
      import("./error-pages/server-error/server-error.component").then(
        (m) => m.ServerErrorComponent,
      ),
  },
  {
    path: "set-password",
    component: RegisterComponent,
  },
  {
    path: "change-credentials",
    component: ChangeCredentialsComponent,
  },
  {
    path: "super-admin",
    component: SuperAdminDashboard,
    canActivate: [superAdminGuard],
    children: [
      { path: "dashboard", component: SuperAdminDashboardPage },
      { path: "merchants", component: Merchant },
      { path: "distributors", component: DistributorList },
      { path: "distributors/profile/:id", component: DistributorProfile },
      { path: "shipments", component: Shipments },
      { path: "tracking", component: Tracking },
      { path: "rate-management", component: RateManagement },
      { path: "merchants/profile/:id", component: MerchantProfile },
      { path: "payments", component: AdminPayment },
      { path: "reports", component: AdminReports },
      { path: "user-management", component: UserManagement },
      { path: "settings", component: AdminSetting },
      { path: "disputes", component: AdminDisputeList },
      { path: "disputes/:id", component: DisputeDetail },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
  {
    path: "merchant",
    component: MerchantDashboard,
    canActivate: [merchantGuard],
    children: [
      { path: "dashboard", component: MarchandeDashboardPage },
      { path: "create-shipment", component: CreateShipment },
      { path: "shipments", component: MerchantShipments },
      { path: "tracking", component: MerchantTracking },
      { path: "bulk-upload", component: BulkUpload },
      { path: "wallet", component: Payments },
      { path: "reports", component: Reports },
      { path: "address-book", component: AddressBook },
      { path: "support", component: MerchantSupport },
      { path: "profile", component: MerchantProfilePage },
      { path: "warehouse", component: MerchantWarehouse },
      { path: "merchants/profile/:id", component: MerchantProfile },
      { path: "disputes", component: MerchantDisputesComponent },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
  {
    path: "distributor",
    component: DistributorDashboard,
    canActivate: [distributorGuard],
    children: [
      { path: "dashboard", component: DistrubuterDashboardPage },

      { path: "merchants", component: DistributorMerchantList },
      { path: "merchants/create", component: CreateMerchant },
      { path: "merchants/:id", component: DistributorMerchantProfile },

      { path: "tracking", component: AwbSearch },
      { path: "wallet", component: DistributorWallet },

      { path: "operations/shipments", component: AllShipments },
      {
        path: "operations",
        redirectTo: "operations/shipments",
        pathMatch: "full",
      },

      { path: "tracking/live", component: LiveTracking },
      { path: "tracking/history", component: TrackingHistory },
      { path: "tracking/search", component: AwbSearch },
      { path: "tracking", redirectTo: "tracking/live", pathMatch: "full" },

      { path: "merchant-finance/wallets", component: AllMerchantWallets },
      { path: "merchant-finance/topup", component: TopupMerchantWallet },
      { path: "merchant-finance/transactions", component: Transactions },

      { path: "finance/cod-management", component: CodManagement },
      { path: "finance/wallet", component: Wallet },
      { path: "finance/transactions", component: Transactions },
      { path: "finance/settlements", component: Settlements },
      { path: "finance", redirectTo: "finance/wallet", pathMatch: "full" },

      { path: "rate-margin/rate-cards", component: RateCards },
      { path: "rate-margin/margins", component: MarginConfig },
      { path: "rate-margin/profit", component: ProfitView },

      { path: "disputes", component: DisputeList },
      { path: "disputes/:id", component: DisputeDetail },

      { path: "reports/shipment-reports", component: ShipmentReports },
      { path: "reports/merchant-revenue", component: MerchantRevenueReport },
      { path: "reports/profit", component: ProfitReport },
      { path: "reports/disputes", component: DisputeReport },
      {
        path: "reports/performance-analytics",
        component: PerformanceAnalytics,
      },
      {
        path: "reports",
        redirectTo: "reports/shipment-reports",
        pathMatch: "full",
      },

      { path: "support/tickets", component: Tickets },
      { path: "support/create-ticket", component: CreateTicket },
      { path: "support/faqs", component: Faqs },
      { path: "support", redirectTo: "support/faqs", pathMatch: "full" },

      { path: "settings/profile", component: ProfileSettings },
      { path: "settings/company-details", component: CompanyDetails },
      { path: "settings/notifications", component: NotificationsSettings },
      { path: "settings/security", component: SecuritySettings },
      { path: "settings/api-settings", component: ApiSettings },
      { path: "settings", redirectTo: "settings/profile", pathMatch: "full" },

      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },

  {
    path: "terms",
    loadComponent: () => import("./pages/terms/terms").then((m) => m.Terms),
  },
  {
    path: "privacy",
    loadComponent: () =>
      import("./pages/privacy/privacy").then((m) => m.Privacy),
  },
  {
    path: "",
    component: Home,
  },
  {
    path: "**",
    redirectTo: "404",
  },
];
