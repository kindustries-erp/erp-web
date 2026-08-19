import { useMemo } from "react";
import type { ReactNode } from "react";
import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Network,
  Factory,
  Shield,
  Receipt,
  Package,
  LayoutDashboard,
  Wallet,
  Settings,
  UserSquare2,
  Car,
  Paperclip,
  Mail,
  Target,
} from "lucide-react";

export interface NavSearchItem {
  key: PageKey;
  label: string;
  group?: string;
  section: string;
  keywords?: string[];
  icon: ReactNode;
}

export function useNavItems(): NavSearchItem[] {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const canReadSalesOrders = useHasPermission("sales_orders", "read");
  const canReadCustomers = useHasPermission("business_partners", "read");
  const canReadSalesReports = useHasPermission("sales_reports", "read");

  const canReadPurchasing = useHasPermission("purchase_orders", "read");
  const canReadSuppliers = useHasPermission("business_partners", "read");
  const canReadPurchasingReports = useHasPermission(
    "purchasing_reports",
    "read",
  );

  const canReadInventoryItems = useHasPermission("inventory_items", "read");
  const canReadInventoryVouchers = useHasPermission(
    "inventory_vouchers",
    "read",
  );

  const canReadVinfast = useHasPermission("vinfast", "read");

  const canReadBom = useHasPermission("bom", "read");
  const canReadProduction = useHasPermission("production", "read");
  const canReadGarageDirect = useHasPermission("garage", "read");
  const canReadGreenway = useHasPermission("greenway_integration", "read");
  const canReadKgara = useHasPermission("kgara_integration", "read");
  const canReadGarage = canReadGarageDirect || canReadGreenway || canReadKgara;

  const canReadInvoices = useHasPermission("invoices", "read");
  const canReadBankStatements = useHasPermission("bank_statements", "read");
  const showAccounting = canReadInvoices || canReadBankStatements;

  const canReadEmployees = useHasPermission("employees", "read");
  const showHR = canReadEmployees;

  const canReadAdminUsers = useHasPermission("admin_users", "read");
  const canReadActivityLogs = useHasPermission("activity_logs", "read");
  const canReadSysTags = useHasPermission("sys_tags", "read");
  const canReadEmailInbox = useHasPermission("email_ingest", "read");

  const showSettingsGeneral =
    canReadAdminUsers || canReadSysTags || canReadBankStatements;
  const showSettingsInventory = canReadInventoryItems;

  return useMemo(() => {
    const items: NavSearchItem[] = [];

    // 1. Dashboard
    items.push({
      key: "dashboard",
      label: t("nav.items.dashboard"),
      section: t("nav.items.dashboard"),
      keywords: ["dashboard", "home", "trang chu", "tong quan"],
      icon: <LayoutDashboard className="w-4 h-4" />,
    });

    // 2. Sales
    const salesSection = t("nav.sections.sales");
    if (canReadSalesReports) {
      items.push({
        key: "sales-report-dashboard",
        label: t("nav.items.salesReportDashboard"),
        section: salesSection,
        keywords: ["sales", "bao cao ban hang", "doanh thu"],
        icon: <LayoutDashboard className="w-4 h-4" />,
      });
    }
    if (canReadSalesOrders) {
      items.push({
        key: "erp-sales-orders",
        label: t("nav.items.erpSalesOrders"),
        section: salesSection,
        keywords: ["sales orders", "don ban hang", "ban hang"],
        icon: <Boxes className="w-4 h-4" />,
      });
    }
    if (canReadCustomers) {
      items.push({
        key: "erp-customers",
        label: t("nav.items.customers"),
        section: salesSection,
        keywords: ["customers", "khach hang", "doi tac", "partner"],
        icon: <Users className="w-4 h-4" />,
      });
    }
    if (canReadSalesOrders) {
      items.push({
        key: "after-sales",
        label: t("nav.items.afterSales"),
        section: salesSection,
        keywords: ["bao hanh", "hau mai", "after sales"],
        icon: <Shield className="w-4 h-4" />,
      });
    }

    // 3. Purchasing
    const purchasingSection = t("nav.sections.purchasing");
    if (canReadPurchasingReports) {
      items.push({
        key: "purchasing-report-dashboard",
        label: t("nav.items.purchasingReportDashboard"),
        section: purchasingSection,
        keywords: ["purchasing", "bao cao mua hang", "mua hang"],
        icon: <LayoutDashboard className="w-4 h-4" />,
      });
    }
    if (canReadPurchasing) {
      items.push({
        key: "purchasing",
        label: t("nav.items.purchasing"),
        section: purchasingSection,
        keywords: ["purchase orders", "don mua hang", "po"],
        icon: <FileText className="w-4 h-4" />,
      });
    }
    if (canReadSuppliers) {
      items.push({
        key: "erp-suppliers",
        label: t("nav.items.suppliers"),
        section: purchasingSection,
        keywords: ["suppliers", "nha cung cap", "vendor", "doi tac"],
        icon: <Building2 className="w-4 h-4" />,
      });
    }

    // 4. Inventory (Kho)
    const inventorySection = t("nav.sections.inventory");
    const trackingGroup = t("nav.items.erpInventoryTrackingGroup");
    if (canReadInventoryItems) {
      items.push({
        key: "inventory-dashboard",
        label: t("nav.items.inventoryDashboard"),
        section: inventorySection,
        keywords: ["kho", "tong quan kho", "inventory"],
        icon: <LayoutDashboard className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-stock",
        label: t("nav.items.erpInventoryStock"),
        section: inventorySection,
        keywords: ["kho", "ton kho", "stock", "hang hoa"],
        icon: <Package className="w-4 h-4" />,
      });
    }
    if (canReadInventoryVouchers) {
      items.push({
        key: "erp-inventory-vouchers",
        label: t("nav.items.erpInventoryVouchers"),
        section: inventorySection,
        keywords: ["kho", "chung tu kho", "nhap kho", "xuat kho", "vouchers"],
        icon: <FileText className="w-4 h-4" />,
      });
    }
    if (canReadInventoryItems) {
      items.push({
        key: "erp-inventory-tracking",
        label: t("nav.items.erpInventoryTracking"),
        group: trackingGroup,
        section: inventorySection,
        keywords: ["kho", "theo doi hang hoa", "xe", "thanh pham", "vin"],
        icon: <Layers className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-tracking-parts",
        label: t("nav.items.erpInventoryTrackingParts"),
        group: trackingGroup,
        section: inventorySection,
        keywords: ["kho", "theo doi hang hoa", "phu tung", "parts"],
        icon: <Layers className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-tracking-lot",
        label: t("nav.items.erpInventoryTrackingLot"),
        group: trackingGroup,
        section: inventorySection,
        keywords: ["kho", "theo doi hang hoa", "lo", "lot"],
        icon: <Layers className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-tracking-custom",
        label: t("nav.items.erpInventoryTrackingCustom"),
        group: trackingGroup,
        section: inventorySection,
        keywords: ["kho", "theo doi hang hoa", "tuy chinh", "custom"],
        icon: <Layers className="w-4 h-4" />,
      });
    }

    // 5. Manufacturing (Sản xuất / Xưởng)
    const manufacturingSection = t("nav.sections.manufacturing");
    if (canReadBom) {
      items.push({
        key: "erp-bom",
        label: t("nav.items.erpBom"),
        section: manufacturingSection,
        keywords: ["bom", "dinh muc", "nguyen vat lieu", "san xuat"],
        icon: <Network className="w-4 h-4" />,
      });
    }
    if (canReadProduction) {
      items.push({
        key: "erp-production",
        label: t("nav.items.erpProduction"),
        section: manufacturingSection,
        keywords: ["san xuat", "production", "lenh san xuat"],
        icon: <Factory className="w-4 h-4" />,
      });
    }

    // 6. Garage
    const garageSection = t("nav.sections.garage", "GARAGE");
    if (canReadGarage) {
      items.push({
        key: "garage-dashboard",
        label: t("nav.items.garageDashboard"),
        section: garageSection,
        keywords: ["garage", "tong quan garage", "dashboard", "xuong"],
        icon: <LayoutDashboard className="w-4 h-4" />,
      });
      items.push({
        key: "garage-cases",
        label: t("nav.items.garageCases"),
        section: garageSection,
        keywords: [
          "garage",
          "phieu dich vu",
          "so bao gia",
          "sua chua",
          "xuong",
        ],
        icon: <Car className="w-4 h-4" />,
      });
      items.push({
        key: "garage-customers",
        label: t("nav.items.garageCustomers", "Khách hàng"),
        section: garageSection,
        keywords: [
          "garage",
          "khach hang",
          "doi tac",
          "cong no",
          "phai thu",
          "tuoi no",
        ],
        icon: <Users className="w-4 h-4" />,
      });
    }

    // 6. Vinfast
    const vinfastSection = t("nav.sections.vinfast");
    const vinfastPartsGroup = t("nav.items.vinfastPartsGroup");
    const vinfastWorkshopGroup = t("nav.items.vinfastWorkshopGroup");
    if (canReadVinfast) {
      items.push({
        key: "vinfast-parts-dashboard",
        label: t("nav.items.vinfastPartsDashboard"),
        group: vinfastPartsGroup,
        section: vinfastSection,
        keywords: ["vinfast", "phu tung", "tong quan"],
        icon: <Package className="w-4 h-4" />,
      });
      items.push({
        key: "vinfast-parts-oto-stock",
        label: t("nav.items.vinfastPartsOtoStock"),
        group: vinfastPartsGroup,
        section: vinfastSection,
        keywords: ["vinfast", "phu tung", "oto", "o to", "ton kho"],
        icon: <Package className="w-4 h-4" />,
      });
      items.push({
        key: "vinfast-parts-xemay-stock",
        label: t("nav.items.vinfastPartsXemayStock"),
        group: vinfastPartsGroup,
        section: vinfastSection,
        keywords: ["vinfast", "phu tung", "xe may", "xemay", "ton kho"],
        icon: <Package className="w-4 h-4" />,
      });
      if (isAdminEmail) {
        items.push({
          key: "vinfast-parts-oto" as PageKey,
          label: "Phụ tùng ôtô",
          group: vinfastPartsGroup,
          section: vinfastSection,
          keywords: ["vinfast", "phu tung", "oto"],
          icon: <Package className="w-4 h-4" />,
        });
        items.push({
          key: "vinfast-parts-xemay" as PageKey,
          label: "Phụ tùng xe máy",
          group: vinfastPartsGroup,
          section: vinfastSection,
          keywords: ["vinfast", "phu tung", "xe may"],
          icon: <Package className="w-4 h-4" />,
        });
      }
      items.push({
        key: "vinfast-invoice-settlement",
        label: t("nav.items.vinfastSettlement"),
        group: vinfastWorkshopGroup,
        section: vinfastSection,
        keywords: ["vinfast", "quyet toan", "hoa don", "settlement"],
        icon: <Factory className="w-4 h-4" />,
      });
    }

    // 7. Accounting (Kế toán)
    const accountingSection = t("nav.sections.accounting");
    const cashflowGroup = t("nav.items.cashflow");
    const invoiceGroup = t("nav.items.erpInvoices");

    if (canReadBankStatements && isAdminEmail) {
      items.push({
        key: "budget",
        label: "Budget",
        section: accountingSection,
        keywords: ["budget", "ngan sach", "ke toan"],
        icon: <Target className="w-4 h-4" />,
      });
    }
    if (canReadBankStatements) {
      items.push({
        key: "cashflow-dashboard",
        label: t("nav.items.cashflowDashboard"),
        group: cashflowGroup,
        section: accountingSection,
        keywords: ["dong tien", "cashflow", "tien mat", "ngan hang"],
        icon: <Wallet className="w-4 h-4" />,
      });
      items.push({
        key: "bank-statement",
        label: t("bankStatement.bankTitle"),
        group: cashflowGroup,
        section: accountingSection,
        keywords: ["dong tien", "sao ke", "ngan hang", "bank statement"],
        icon: <Wallet className="w-4 h-4" />,
      });
      items.push({
        key: "cash-statement",
        label: t("bankStatement.cashTitle"),
        group: cashflowGroup,
        section: accountingSection,
        keywords: ["dong tien", "sao ke", "tien mat", "cash statement"],
        icon: <Wallet className="w-4 h-4" />,
      });
    }
    if (canReadInvoices) {
      items.push({
        key: "invoice-dashboard",
        label: t("nav.items.invoiceDashboard") || "Tổng quan hóa đơn",
        group: invoiceGroup,
        section: accountingSection,
        keywords: ["hoa don", "hóa đơn", "invoices", "tong quan", "dashboard"],
        icon: <Receipt className="w-4 h-4" />,
      });
      items.push({
        key: "erp-invoices-in",
        label: "Hóa đơn đầu vào",
        group: invoiceGroup,
        section: accountingSection,
        keywords: [
          "hoa don",
          "hóa đơn",
          "invoices",
          "dau vao",
          "đầu vào",
          "inbound",
          "hoa don mua vao",
          "mua hang",
        ],
        icon: <Receipt className="w-4 h-4" />,
      });
      items.push({
        key: "erp-invoices-out",
        label: "Hóa đơn đầu ra",
        group: invoiceGroup,
        section: accountingSection,
        keywords: [
          "hoa don",
          "hóa đơn",
          "invoices",
          "dau ra",
          "đầu ra",
          "outbound",
          "hoa don ban ra",
          "ban hang",
        ],
        icon: <Receipt className="w-4 h-4" />,
      });
      items.push({
        key: "erp-invoices-draft",
        label: "Hóa đơn nháp",
        group: invoiceGroup,
        section: accountingSection,
        keywords: [
          "hoa don",
          "hóa đơn",
          "invoices",
          "nhap",
          "draft",
          "hoa don nhap",
        ],
        icon: <Receipt className="w-4 h-4" />,
      });
    }
    if (showAccounting) {
      items.push({
        key: "journal-entry",
        label: t("nav.items.reportJournal"),
        section: accountingSection,
        keywords: ["nhat ky chung", "so cai", "ke toan", "journal", "ledger"],
        icon: <FileText className="w-4 h-4" />,
      });
      items.push({
        key: "settings-accounts",
        label: t("nav.items.catalogAccounts"),
        section: accountingSection,
        keywords: ["tai khoan", "he thong tai khoan", "chart of accounts"],
        icon: <Layers className="w-4 h-4" />,
      });
    }

    // 8. Admin (Quản trị)
    const adminSection = t("nav.sections.admin");
    if (showHR) {
      items.push({
        key: "erp-employees",
        label: t("nav.items.erpEmployees"),
        section: adminSection,
        keywords: ["nhan vien", "nhan su", "employees", "staff", "hr"],
        icon: <UserSquare2 className="w-4 h-4" />,
      });
    }
    items.push({
      key: "attachments",
      label: t("nav.items.attachments"),
      section: adminSection,
      keywords: ["tai lieu", "dinh kem", "attachments", "files"],
      icon: <Paperclip className="w-4 h-4" />,
    });

    // 9. Settings (Hệ thống)
    const settingsSection = t("nav.sections.settings");
    const accessGroup = t("nav.items.accessControl");
    const catalogGroup = t("nav.items.catalog");
    const inventoryMastersGroup = t("nav.items.erpInventoryMasters");

    if (canReadEmailInbox && isAdminEmail) {
      items.push({
        key: "email-inbox",
        label: t("nav.items.emailInbox"),
        section: settingsSection,
        keywords: ["email", "hop thu", "mail", "inbox"],
        icon: <Mail className="w-4 h-4" />,
      });
    }
    if (canReadAdminUsers) {
      items.push({
        key: "erp-users",
        label: t("nav.items.users"),
        group: accessGroup,
        section: settingsSection,
        keywords: ["nguoi dung", "users", "tai khoan"],
        icon: <Shield className="w-4 h-4" />,
      });
      items.push({
        key: "erp-permissions-core",
        label: t("nav.items.phanquyen"),
        group: accessGroup,
        section: settingsSection,
        keywords: ["phan quyen", "vai tro", "permissions", "roles"],
        icon: <Shield className="w-4 h-4" />,
      });
    }
    if (canReadActivityLogs) {
      items.push({
        key: "erp-activity-logs",
        label: t("nav.items.activitylog"),
        group: accessGroup,
        section: settingsSection,
        keywords: ["nhat ky hoat dong", "activity logs", "audit", "lich su"],
        icon: <Shield className="w-4 h-4" />,
      });
    }
    if (showSettingsGeneral && canReadAdminUsers) {
      items.push({
        key: "settings-branch",
        label: t("thietlap.tabs.chi-nhanh"),
        group: catalogGroup,
        section: settingsSection,
        keywords: ["chi nhanh", "branch", "thiet lap", "cai dat"],
        icon: <Settings className="w-4 h-4" />,
      });
    }
    if (showSettingsGeneral && canReadBankStatements) {
      items.push({
        key: "settings-bank",
        label: t("thietlap.tabs.ngan-hang"),
        group: catalogGroup,
        section: settingsSection,
        keywords: ["ngan hang", "bank", "tai khoan ngan hang", "thiet lap"],
        icon: <Settings className="w-4 h-4" />,
      });
      items.push({
        key: "settings-cash-fund",
        label: t("thietlap.tabs.quy"),
        group: catalogGroup,
        section: settingsSection,
        keywords: ["quy tien mat", "tien mat", "cash fund", "thiet lap"],
        icon: <Settings className="w-4 h-4" />,
      });
    }
    if (showSettingsGeneral && canReadSysTags) {
      items.push({
        key: "sys-tags",
        label: t("nav.items.sysTags"),
        group: catalogGroup,
        section: settingsSection,
        keywords: ["tags", "the", "quan ly the", "thiet lap"],
        icon: <Settings className="w-4 h-4" />,
      });
    }
    if (showSettingsInventory) {
      items.push({
        key: "erp-inventory-uom",
        label: t("nav.items.erpInventoryUom"),
        group: inventoryMastersGroup,
        section: settingsSection,
        keywords: ["don vi tinh", "uom", "kho", "thiet lap kho"],
        icon: <Layers className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-item-types",
        label: t("nav.items.erpInventoryItemTypes"),
        group: inventoryMastersGroup,
        section: settingsSection,
        keywords: ["loai hang hoa", "item types", "kho", "thiet lap kho"],
        icon: <Layers className="w-4 h-4" />,
      });
      items.push({
        key: "erp-inventory-tracking-categories",
        label: t("nav.items.erpInventoryTrackingCategories"),
        group: inventoryMastersGroup,
        section: settingsSection,
        keywords: ["nhom theo doi", "tracking", "kho", "thiet lap kho"],
        icon: <Layers className="w-4 h-4" />,
      });
    }

    return items;
  }, [
    t,
    canReadSalesOrders,
    canReadCustomers,
    canReadSalesReports,
    canReadPurchasing,
    canReadSuppliers,
    canReadPurchasingReports,
    canReadInventoryItems,
    canReadInventoryVouchers,
    canReadVinfast,
    isAdminEmail,
    canReadBom,
    canReadProduction,
    canReadGarage,
    canReadInvoices,
    canReadBankStatements,
    showAccounting,
    showHR,
    canReadAdminUsers,
    canReadActivityLogs,
    canReadSysTags,
    canReadEmailInbox,
    showSettingsGeneral,
    showSettingsInventory,
  ]);
}
