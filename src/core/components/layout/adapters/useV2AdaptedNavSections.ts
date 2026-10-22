import { useMemo } from "react";
import { useT } from "@/core/i18n";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  V2SidebarSectionData,
  V2SidebarItem,
} from "@/v2/shared/components/organisms/v2-sidebar";
import {
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Network,
  Factory,
  Shield,
  Package,
  LayoutDashboard,
  Wallet,
  Settings,
  UserSquare2,
  Car,
  Paperclip,
  Mail,
  PackageCheck,
  Receipt,
  ReceiptText,
  Sliders,
} from "lucide-react";

export function useV2AdaptedNavSections(): V2SidebarSectionData[] {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  // RBAC checks
  const canReadDashboard = useHasPermission(
    ErpResource.DASHBOARD,
    ErpAction.READ,
  );
  const canReadAttachments = useHasPermission(
    ErpResource.ATTACHMENTS,
    ErpAction.READ,
  );

  const canReadSalesOrders = useHasPermission(
    ErpResource.SALES_ORDERS,
    ErpAction.READ,
  );
  const canReadCustomers = useHasPermission(
    ErpResource.BUSINESS_PARTNERS,
    ErpAction.READ,
  );
  const canReadSalesReports = useHasPermission(
    ErpResource.SALES_REPORTS,
    ErpAction.READ,
  );
  const showSales =
    canReadSalesOrders || canReadCustomers || canReadSalesReports;

  const canReadPurchasing = useHasPermission(
    ErpResource.PURCHASE_ORDERS,
    ErpAction.READ,
  );
  const canReadSuppliers = useHasPermission(
    ErpResource.BUSINESS_PARTNERS,
    ErpAction.READ,
  );
  const canReadPurchasingReports = useHasPermission(
    ErpResource.PURCHASING_REPORTS,
    ErpAction.READ,
  );
  const showPurchasing =
    canReadPurchasing || canReadSuppliers || canReadPurchasingReports;

  const canReadInventoryItems = useHasPermission(
    ErpResource.INVENTORY_ITEMS,
    ErpAction.READ,
  );
  const canReadInventoryVouchers = useHasPermission(
    ErpResource.INVENTORY_VOUCHERS,
    ErpAction.READ,
  );
  const showInventory = canReadInventoryItems || canReadInventoryVouchers;

  const canReadBom = useHasPermission(ErpResource.BOM, ErpAction.READ);
  const canReadProduction = useHasPermission(
    ErpResource.PRODUCTION,
    ErpAction.READ,
  );
  const showManufacturing = canReadBom || canReadProduction;

  // Garage
  const canReadGarageCashflow = useHasPermission(
    ErpResource.GARAGE_CASHFLOW,
    ErpAction.READ,
  );
  const canReadGarageCases = useHasPermission(
    ErpResource.GARAGE,
    ErpAction.READ,
  );
  const canReadGarageDebts = useHasPermission(
    ErpResource.GARAGE_DEBTS,
    ErpAction.READ,
  );
  const canReadGarageOpex = canReadGarageCases;
  const showGarage =
    canReadGarageCases ||
    canReadGarageCashflow ||
    canReadGarageDebts ||
    canReadGarageOpex;

  // Vinfast
  const canReadVinfast = useHasPermission(ErpResource.VINFAST, ErpAction.READ);

  // Accounting
  const canReadInvoices = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.READ,
  );
  const canReadDebts =
    useHasPermission(ErpResource.INVOICE_DEBTS, ErpAction.READ) ||
    canReadInvoices;
  const canReadBankStatements = useHasPermission(
    ErpResource.BANK_STATEMENTS,
    ErpAction.READ,
  );
  const canReadCashStatements = useHasPermission(
    ErpResource.CASH_STATEMENTS,
    ErpAction.READ,
  );
  const showCashflow = canReadBankStatements || canReadCashStatements;
  const showOpex = canReadBankStatements && isAdminEmail;
  const showAccounting = canReadInvoices || canReadDebts || showCashflow;

  // HR & Admin
  const canReadEmployees = useHasPermission(
    ErpResource.EMPLOYEES,
    ErpAction.READ,
  );
  const showHR = canReadEmployees;
  const showAdmin = showHR || canReadAttachments;

  // Settings
  const canReadAdminUsers = useHasPermission(
    ErpResource.ADMIN_USERS,
    ErpAction.READ,
  );
  const canReadActivityLogs = useHasPermission(
    ErpResource.ACTIVITY_LOGS,
    ErpAction.READ,
  );
  const canReadSysTags = useHasPermission(ErpResource.SYS_TAGS, ErpAction.READ);
  const canReadEmailInbox = useHasPermission(
    ErpResource.EMAIL_INGEST,
    ErpAction.READ,
  );
  const canReadCustomFields =
    canReadAdminUsers ||
    canReadInvoices ||
    canReadBankStatements ||
    canReadBom ||
    canReadInventoryItems ||
    canReadInventoryVouchers;

  const showSettingsAccess = canReadAdminUsers || canReadActivityLogs;
  const showSettingsGeneral =
    canReadAdminUsers ||
    canReadSysTags ||
    canReadBankStatements ||
    canReadCashStatements;
  const showSettings =
    showSettingsAccess ||
    showSettingsGeneral ||
    canReadEmailInbox ||
    canReadInvoices ||
    canReadBankStatements ||
    canReadBom ||
    canReadInventoryItems ||
    canReadInventoryVouchers;

  return useMemo(() => {
    const sections: V2SidebarSectionData[] = [];

    // 1. Dashboard
    if (canReadDashboard) {
      sections.push({
        id: "sec-dashboard",
        label: undefined,
        items: [
          {
            id: "dashboard",
            label: t("nav.items.dashboard", "Tổng quan"),
            icon: LayoutDashboard,
            href: "/dashboard",
          },
        ],
      });
    }

    // 2. Bán hàng
    if (showSales) {
      const items: V2SidebarItem[] = [];
      if (canReadSalesReports) {
        items.push({
          id: "sales-report-dashboard",
          label: t("nav.items.salesReportDashboard", "Báo cáo bán hàng"),
          icon: LayoutDashboard,
          href: "/sales-report-dashboard",
        });
      }
      if (canReadSalesOrders) {
        items.push({
          id: "erp-sales-orders",
          label: t("nav.items.erpSalesOrders", "Đơn bán hàng"),
          icon: Boxes,
          href: "/erp-sales-orders",
        });
      }
      if (canReadCustomers) {
        items.push({
          id: "erp-customers",
          label: t("nav.items.customers", "Khách hàng"),
          icon: Users,
          href: "/erp-customers",
        });
      }
      if (canReadSalesOrders) {
        items.push({
          id: "after-sales",
          label: t("nav.items.afterSales", "Sau bán hàng"),
          icon: Shield,
          href: "/after-sales",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-sales",
          label: t("nav.sections.sales", "BÁN HÀNG"),
          items,
        });
      }
    }

    // 3. Mua hàng
    if (showPurchasing) {
      const items: V2SidebarItem[] = [];
      if (canReadPurchasingReports) {
        items.push({
          id: "purchasing-report-dashboard",
          label: t("nav.items.purchasingReportDashboard", "Báo cáo mua hàng"),
          icon: LayoutDashboard,
          href: "/purchasing-report-dashboard",
        });
      }
      if (canReadPurchasing) {
        items.push({
          id: "purchasing",
          label: t("nav.items.purchasing", "Mua hàng"),
          icon: FileText,
          href: "/purchasing",
        });
      }
      if (canReadSuppliers) {
        items.push({
          id: "erp-suppliers",
          label: t("nav.items.suppliers", "Nhà cung cấp"),
          icon: Building2,
          href: "/erp-suppliers",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-purchasing",
          label: t("nav.sections.purchasing", "MUA HÀNG"),
          items,
        });
      }
    }

    // 4. Kho
    if (showInventory) {
      const items: V2SidebarItem[] = [];
      if (canReadInventoryItems) {
        items.push({
          id: "inventory-dashboard",
          label: t("nav.items.inventoryDashboard", "Tổng quan kho"),
          icon: LayoutDashboard,
          href: "/inventory-dashboard",
        });
      }
      if (canReadInventoryVouchers) {
        items.push({
          id: "erp-inventory-vouchers",
          label: t("nav.items.erpInventoryVouchers", "Chứng từ kho"),
          icon: FileText,
          href: "/erp-inventory-vouchers",
        });
      }
      if (canReadInventoryItems) {
        items.push({
          id: "erp-inventory-stock",
          label: t("nav.items.erpInventoryStock", "Tồn kho"),
          icon: Package,
          href: "/erp-inventory-stock",
        });
        items.push({
          id: "erp-inventory-tracking",
          label: t("nav.items.erpInventoryTrackingGroup", "Theo dõi hàng hoá"),
          icon: Layers,
          href: "/erp-inventory-tracking",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-inventory",
          label: t("nav.sections.inventory", "KHO"),
          items,
        });
      }
    }

    // 5. Sản xuất / Xưởng
    if (showManufacturing) {
      const items: V2SidebarItem[] = [];
      if (canReadBom) {
        items.push({
          id: "erp-bom",
          label: t("nav.items.erpBom", "Định mức BOM"),
          icon: Network,
          href: "/erp-bom",
        });
      }
      if (canReadProduction) {
        items.push({
          id: "erp-production",
          label: t("nav.items.erpProduction", "Lệnh sản xuất"),
          icon: Factory,
          href: "/erp-production",
        });
      }
      if (canReadProduction || canReadInventoryItems) {
        items.push({
          id: "erp-finished-goods",
          label: t("nav.items.erpFinishedGoods", "Thành phẩm"),
          icon: PackageCheck,
          href: "/erp-finished-goods",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-manufacturing",
          label: t("nav.sections.manufacturing", "SẢN XUẤT / XƯỞNG"),
          items,
        });
      }
    }

    // 6. Garage
    if (showGarage) {
      const items: V2SidebarItem[] = [];
      if (canReadGarageCases) {
        items.push({
          id: "garage-cases",
          label: t("nav.items.garageCases", "Hoạt động garage"),
          icon: Car,
          href: "/garage-cases",
        });
      }
      if (canReadGarageCashflow) {
        items.push({
          id: "garage-cashflow",
          label: t("nav.items.garageCashflow", "Thu chi garage"),
          icon: Wallet,
          href: "/garage-cashflow",
        });
      }
      if (canReadGarageDebts) {
        items.push({
          id: "garage-debts",
          label: t("nav.items.garageDebts", "Công nợ garage"),
          icon: Users,
          href: "/garage-debts",
        });
      }
      if (canReadGarageOpex) {
        items.push({
          id: "garage-opex",
          label: t("nav.items.garageOpex", "Chi phí vận hành Garage"),
          icon: Receipt,
          href: "/garage-opex",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-garage",
          label: t("nav.sections.garage", "GARAGE"),
          items,
        });
      }
    }

    // 7. Vinfast
    if (canReadVinfast) {
      sections.push({
        id: "sec-vinfast",
        label: t("nav.sections.vinfast", "VINFAST"),
        items: [
          {
            id: "vinfast-parts-stock",
            label: t("nav.items.vinfastPartsGroup", "Phụ tùng Vinfast"),
            icon: Package,
            href: "/vinfast-parts-stock",
          },
        ],
      });
    }

    // 8. Kế toán
    if (showAccounting) {
      const items: V2SidebarItem[] = [];
      if (showCashflow) {
        items.push({
          id: "cashflow",
          label: t("nav.items.cashflow", "Dòng tiền"),
          icon: Wallet,
          href: "/cashflow",
        });
      }
      if (canReadInvoices) {
        items.push({
          id: "erp-invoices",
          label: t("nav.items.invoices", "Hóa đơn"),
          icon: ReceiptText,
          href: "/erp-invoices",
        });
      }
      if (canReadDebts) {
        items.push({
          id: "invoice-debts",
          label: t("nav.items.debts", "Công nợ theo đối tượng"),
          icon: Users,
          href: "/invoice-debts",
        });
      }
      if (showOpex) {
        items.push({
          id: "opex",
          label: t("nav.items.opex", "Chi phí vận hành"),
          icon: Receipt,
          href: "/opex",
        });
      }
      items.push({
        id: "journal-entry",
        label: t("nav.items.journal", "Nhật ký chung"),
        icon: FileText,
        href: "/journal-entry",
      });
      items.push({
        id: "settings-accounts",
        label: t("nav.items.accounts", "Hệ thống tài khoản"),
        icon: Layers,
        href: "/settings-accounts",
      });

      if (items.length > 0) {
        sections.push({
          id: "sec-accounting",
          label: t("nav.sections.accounting", "KẾ TOÁN"),
          items,
        });
      }
    }

    // 9. Admin / HR
    if (showAdmin) {
      const items: V2SidebarItem[] = [];
      if (showHR) {
        items.push({
          id: "erp-employees",
          label: t("nav.items.erpEmployees", "Nhân sự"),
          icon: UserSquare2,
          href: "/erp-employees",
        });
      }
      if (canReadAttachments) {
        items.push({
          id: "attachments",
          label: t("nav.items.attachments", "Tệp đính kèm"),
          icon: Paperclip,
          href: "/attachments",
        });
      }
      if (items.length > 0) {
        sections.push({
          id: "sec-admin",
          label: t("nav.sections.admin", "QUẢN TRỊ"),
          items,
        });
      }
    }

    // 10. Thiết lập
    if (showSettings) {
      const items: V2SidebarItem[] = [];
      if (canReadEmailInbox && isAdminEmail) {
        items.push({
          id: "email-inbox",
          label: t("nav.items.emailInbox", "Hòm thư hệ thống"),
          icon: Mail,
          href: "/email-inbox",
        });
      }
      if (canReadAdminUsers) {
        items.push({
          id: "erp-users",
          label: t("nav.items.users", "Người dùng & Tài khoản"),
          icon: Users,
          href: "/erp-users",
        });
        items.push({
          id: "erp-permissions-core",
          label: t("nav.items.phanquyen", "Phân quyền vai trò"),
          icon: Shield,
          href: "/erp-permissions-core",
        });
      }
      if (canReadActivityLogs) {
        items.push({
          id: "erp-activity-logs",
          label: t("nav.items.activitylog", "Nhật ký hoạt động"),
          icon: FileText,
          href: "/erp-activity-logs",
        });
      }
      if (canReadAdminUsers) {
        items.push({
          id: "settings-branch",
          label: t("thietlap.tabs.chi-nhanh", "Chi nhánh"),
          icon: Building2,
          href: "/settings-branch",
        });
      }
      if (canReadSysTags) {
        items.push({
          id: "sys-tags",
          label: t("nav.items.sysTags", "Thẻ hệ thống (Tags)"),
          icon: Settings,
          href: "/sys-tags",
        });
      }
      if (canReadCustomFields) {
        items.push({
          id: "custom-fields",
          label: t("nav.items.customFields", "Trường tùy chỉnh"),
          icon: Sliders,
          href: "/custom-fields",
        });
      }

      if (items.length > 0) {
        sections.push({
          id: "sec-settings",
          label: t("nav.sections.settings", "THIẾT LẬP"),
          items,
        });
      }
    }

    return sections;
  }, [
    canReadDashboard,
    showSales,
    canReadSalesReports,
    canReadSalesOrders,
    canReadCustomers,
    showPurchasing,
    canReadPurchasingReports,
    canReadPurchasing,
    canReadSuppliers,
    showInventory,
    canReadInventoryItems,
    canReadInventoryVouchers,
    showManufacturing,
    canReadBom,
    canReadProduction,
    showGarage,
    canReadGarageCases,
    canReadGarageCashflow,
    canReadGarageDebts,
    canReadGarageOpex,
    canReadVinfast,
    showAccounting,
    showCashflow,
    canReadInvoices,
    canReadDebts,
    showOpex,
    showAdmin,
    showHR,
    canReadAttachments,
    showSettings,
    canReadEmailInbox,
    isAdminEmail,
    canReadAdminUsers,
    canReadActivityLogs,
    canReadSysTags,
    canReadCustomFields,
    t,
  ]);
}
