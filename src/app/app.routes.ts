import { Routes } from "@angular/router";

import { superAdminGuard } from "./guards/super-admin.guard";
import { distributorGuard } from "./guards/distributor.guard";
import { merchantGuard } from "./guards/merchant.guard";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./register/register.component").then((m) => m.RegisterComponent),
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
    loadComponent: () => import("./register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "change-credentials",
    loadComponent: () =>
      import("./change-credentials/change-credentials.component").then(
        (m) => m.ChangeCredentialsComponent,
      ),
    canActivate: [authGuard],
  },

  // ─── Super Admin Portal ────────────────────────────────────────────────────
  {
    path: "super-admin",
    loadComponent: () =>
      import("./dashboards/super-admin-dashboard/super-admin-dashboard").then(
        (m) => m.SuperAdminDashboard,
      ),
    canActivate: [superAdminGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/super-admin/dashboard/SuperAdminDashboardPage").then(
            (m) => m.SuperAdminDashboardPage,
          ),
      },
      {
        path: "merchants",
        loadComponent: () =>
          import("./pages/super-admin/merchant/merchant-list/merchant-list").then(
            (m) => m.Merchant,
          ),
      },
      {
        path: "merchants/profile/:id",
        loadComponent: () =>
          import("./pages/super-admin/merchant/merchant-profile/merchant-profile").then(
            (m) => m.MerchantProfile,
          ),
      },
      {
        path: "distributors",
        loadComponent: () =>
          import("./pages/super-admin/distributor/distributor-list/distributor-list").then(
            (m) => m.DistributorList,
          ),
      },
      {
        path: "distributors/profile/:id",
        loadComponent: () =>
          import("./pages/super-admin/distributor/distributor-profile/distributor-profile").then(
            (m) => m.DistributorProfile,
          ),
      },
      {
        path: "shipments",
        loadComponent: () =>
          import("./pages/super-admin/shipments/shipments").then((m) => m.Shipments),
      },
      {
        path: "tracking",
        loadComponent: () =>
          import("./pages/super-admin/tracking/tracking").then((m) => m.Tracking),
      },
      {
        path: "rate-management",
        loadComponent: () =>
          import("./pages/super-admin/rate-management/rate-management").then(
            (m) => m.RateManagement,
          ),
      },
      {
        path: "payments",
        loadComponent: () =>
          import("./pages/super-admin/admin-payment/admin-payment").then(
            (m) => m.AdminPayment,
          ),
      },
      {
        path: "reports",
        loadComponent: () =>
          import("./pages/super-admin/admin-reports/admin-reports").then(
            (m) => m.AdminReports,
          ),
      },
      {
        path: "user-management",
        loadComponent: () =>
          import("./pages/super-admin/user-management/user-management").then(
            (m) => m.UserManagement,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./pages/super-admin/admin-setting/admin-setting").then(
            (m) => m.AdminSetting,
          ),
      },
      {
        path: "disputes",
        loadComponent: () =>
          import("./pages/super-admin/disputes/dispute-list/dispute-list").then(
            (m) => m.AdminDisputeList,
          ),
      },
      {
        path: "disputes/:id",
        loadComponent: () =>
          import("./pages/distributor/disputes/dispute-detail/dispute-detail").then(
            (m) => m.DisputeDetail,
          ),
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },

  // ─── Merchant Portal ───────────────────────────────────────────────────────
  {
    path: "merchant",
    loadComponent: () =>
      import("./dashboards/merchant-dashboard/merchant-dashboard").then(
        (m) => m.MerchantDashboard,
      ),
    canActivate: [merchantGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/merchant/dashboard/dashboard").then(
            (m) => m.MarchandeDashboardPage,
          ),
      },
      {
        path: "create-shipment",
        loadComponent: () =>
          import("./pages/merchant/create-shipment/create-shipment").then(
            (m) => m.CreateShipment,
          ),
      },
      {
        path: "shipments",
        loadComponent: () =>
          import("./pages/merchant/shipments/merchant-shipments").then(
            (m) => m.MerchantShipments,
          ),
      },
      {
        path: "tracking",
        loadComponent: () =>
          import("./pages/merchant/merchant-tracking/merchant-tracking").then(
            (m) => m.MerchantTracking,
          ),
      },
      {
        path: "bulk-upload",
        loadComponent: () =>
          import("./pages/merchant/bulk-upload/bulk-upload").then((m) => m.BulkUpload),
      },
      {
        path: "wallet",
        loadComponent: () =>
          import("./pages/merchant/payments/payments").then((m) => m.Payments),
      },
      {
        path: "reports",
        loadComponent: () =>
          import("./pages/merchant/reports/reports").then((m) => m.Reports),
      },
      {
        path: "address-book",
        loadComponent: () =>
          import("./pages/merchant/address-book/address-book").then((m) => m.AddressBook),
      },
      {
        path: "support",
        loadComponent: () =>
          import("./pages/merchant/merchant-support/merchant-support").then(
            (m) => m.MerchantSupport,
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./pages/merchant/merchant-profile-page/merchant-profile-page").then(
            (m) => m.MerchantProfilePage,
          ),
      },
      {
        path: "warehouse",
        loadComponent: () =>
          import("./pages/merchant/merchant-warehouse/merchant-warehouse").then(
            (m) => m.MerchantWarehouse,
          ),
      },
      {
        path: "merchants/profile/:id",
        loadComponent: () =>
          import("./pages/super-admin/merchant/merchant-profile/merchant-profile").then(
            (m) => m.MerchantProfile,
          ),
      },
      {
        path: "disputes",
        loadComponent: () =>
          import("./pages/merchant/disputes/disputes").then(
            (m) => m.MerchantDisputesComponent,
          ),
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },

  // ─── Distributor Portal ────────────────────────────────────────────────────
  {
    path: "distributor",
    loadComponent: () =>
      import("./dashboards/distributor-dashboard/distributor-dashboard").then(
        (m) => m.DistributorDashboard,
      ),
    canActivate: [distributorGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/distributor/dashboard/DistrubuterDashboardPage").then(
            (m) => m.DistrubuterDashboardPage,
          ),
      },
      {
        path: "merchants",
        loadComponent: () =>
          import("./pages/distributor/merchants/merchant-list/merchant-list").then(
            (m) => m.DistributorMerchantList,
          ),
      },
      {
        path: "merchants/create",
        loadComponent: () =>
          import("./pages/distributor/merchants/create-merchant/create-merchant").then(
            (m) => m.CreateMerchant,
          ),
      },
      {
        path: "merchants/:id",
        loadComponent: () =>
          import("./pages/distributor/merchants/merchant-profile/merchant-profile").then(
            (m) => m.DistributorMerchantProfile,
          ),
      },
      {
        path: "tracking",
        loadComponent: () =>
          import("./pages/distributor/tracking/awb-search/awb-search").then(
            (m) => m.AwbSearch,
          ),
      },
      {
        path: "tracking/history",
        loadComponent: () =>
          import("./pages/distributor/tracking/tracking-history/tracking-history").then(
            (m) => m.TrackingHistory,
          ),
      },
      {
        path: "tracking/search",
        loadComponent: () =>
          import("./pages/distributor/tracking/awb-search/awb-search").then(
            (m) => m.AwbSearch,
          ),
      },
      {
        path: "wallet",
        loadComponent: () =>
          import("./pages/distributor/wallet/wallet").then((m) => m.DistributorWallet),
      },
      {
        path: "operations/shipments",
        loadComponent: () =>
          import("./pages/distributor/all-shipments/all-shipments").then(
            (m) => m.AllShipments,
          ),
      },
      { path: "operations", redirectTo: "operations/shipments", pathMatch: "full" },
      {
        path: "merchant-finance/wallets",
        loadComponent: () =>
          import("./pages/distributor/merchant-finance/all-merchant-wallets/all-merchant-wallets").then(
            (m) => m.AllMerchantWallets,
          ),
      },
      {
        path: "merchant-finance/topup",
        loadComponent: () =>
          import("./pages/distributor/merchant-finance/topup-merchant-wallet/topup-merchant-wallet").then(
            (m) => m.TopupMerchantWallet,
          ),
      },
      {
        path: "merchant-finance/transactions",
        loadComponent: () =>
          import("./pages/distributor/finance/transactions/transactions").then(
            (m) => m.Transactions,
          ),
      },
      {
        path: "finance/cod-management",
        loadComponent: () =>
          import("./pages/distributor/finance/cod-management/cod-management").then(
            (m) => m.CodManagement,
          ),
      },
      {
        path: "finance/transactions",
        loadComponent: () =>
          import("./pages/distributor/finance/transactions/transactions").then(
            (m) => m.Transactions,
          ),
      },
      {
        path: "finance/settlements",
        loadComponent: () =>
          import("./pages/distributor/finance/settlements/settlements").then(
            (m) => m.Settlements,
          ),
      },
      {
        path: "rate-margin/rate-cards",
        loadComponent: () =>
          import("./pages/distributor/rate-margin/rate-cards/rate-cards").then(
            (m) => m.RateCards,
          ),
      },
      {
        path: "rate-margin/margins",
        loadComponent: () =>
          import("./pages/distributor/rate-margin/margin-config/margin-config").then(
            (m) => m.MarginConfig,
          ),
      },
      {
        path: "rate-margin/profit",
        loadComponent: () =>
          import("./pages/distributor/rate-margin/profit-view/profit-view").then(
            (m) => m.ProfitView,
          ),
      },
      {
        path: "disputes",
        loadComponent: () =>
          import("./pages/distributor/disputes/dispute-list/dispute-list").then(
            (m) => m.DisputeList,
          ),
      },
      {
        path: "disputes/:id",
        loadComponent: () =>
          import("./pages/distributor/disputes/dispute-detail/dispute-detail").then(
            (m) => m.DisputeDetail,
          ),
      },
      {
        path: "reports/shipment-reports",
        loadComponent: () =>
          import("./pages/distributor/reports/shipment-reports/shipment-reports").then(
            (m) => m.ShipmentReports,
          ),
      },
      {
        path: "reports/merchant-revenue",
        loadComponent: () =>
          import("./pages/distributor/reports/merchant-revenue/merchant-revenue").then(
            (m) => m.MerchantRevenueReport,
          ),
      },
      {
        path: "reports/profit",
        loadComponent: () =>
          import("./pages/distributor/reports/profit-report/profit-report").then(
            (m) => m.ProfitReport,
          ),
      },
      {
        path: "reports/disputes",
        loadComponent: () =>
          import("./pages/distributor/reports/dispute-report/dispute-report").then(
            (m) => m.DisputeReport,
          ),
      },
      {
        path: "reports",
        redirectTo: "reports/shipment-reports",
        pathMatch: "full",
      },
      {
        path: "support/tickets",
        loadComponent: () =>
          import("./pages/distributor/support/tickets/tickets").then((m) => m.Tickets),
      },
      {
        path: "support/create-ticket",
        loadComponent: () =>
          import("./pages/distributor/support/create-ticket/create-ticket").then(
            (m) => m.CreateTicket,
          ),
      },
      { path: "support", redirectTo: "support/tickets", pathMatch: "full" },
      {
        path: "settings/profile",
        loadComponent: () =>
          import("./pages/distributor/settings/profile/profile").then(
            (m) => m.ProfileSettings,
          ),
      },
      {
        path: "settings/security",
        loadComponent: () =>
          import("./pages/distributor/settings/security/security").then(
            (m) => m.SecuritySettings,
          ),
      },
      { path: "settings", redirectTo: "settings/profile", pathMatch: "full" },

      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },

  // ─── Public Pages ──────────────────────────────────────────────────────────
  {
    path: "terms",
    loadComponent: () => import("./pages/terms/terms").then((m) => m.Terms),
  },
  {
    path: "privacy",
    loadComponent: () => import("./pages/privacy/privacy").then((m) => m.Privacy),
  },
  {
    path: "",
    loadComponent: () => import("./home/home").then((m) => m.Home),
  },
  {
    path: "**",
    redirectTo: "404",
  },
];
