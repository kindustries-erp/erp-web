import { useMemo } from "react";
import { useAppStore, STATIC_TABS } from "@/core/config/appStore";
import type { PageKey } from "@/shared/types";
import { useT } from "@/core/i18n";
import type { V2TabEntry } from "@/v2/shared/components/molecules/v2-tab-bar";
import {
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  Building2,
  Layers,
  Car,
  Network,
  Factory,
  Package,
  Barcode,
  ReceiptText,
  Shield,
  Target,
  PackageCheck,
  Wallet,
  Settings,
  UserSquare2,
  Paperclip,
  Mail,
  type V2IconType as LucideIcon,
} from "@/v2/shared/components/atoms";

const TAB_ICONS: Partial<Record<PageKey, LucideIcon>> = {
  dashboard: LayoutDashboard,
  opex: Target,
  "erp-sales-orders": Boxes,
  "erp-customers": Users,
  "after-sales": Shield,
  purchasing: FileText,
  "erp-suppliers": Building2,
  "inventory-dashboard": LayoutDashboard,
  "erp-inventory-stock": Package,
  "erp-inventory-tracking": Barcode,
  "erp-inventory-vouchers": ReceiptText,
  "erp-bom": Network,
  "erp-production": Factory,
  "erp-finished-goods": PackageCheck,
  "garage-dashboard": LayoutDashboard,
  "garage-cases": Car,
  "garage-opex": ReceiptText,
  "garage-cashflow": Wallet,
  "garage-customers": Users,
  "garage-partners": Users,
  "garage-debts": Users,
  "invoice-debts": ReceiptText,
  "vinfast-parts-stock": Package,
  cashflow: Wallet,
  "erp-invoices": ReceiptText,
  "journal-entry": FileText,
  "settings-accounts": Layers,
  "erp-employees": UserSquare2,
  attachments: Paperclip,
  "email-inbox": Mail,
  "erp-users": Users,
  "erp-permissions-core": Shield,
  "erp-activity-logs": FileText,
  "settings-branch": Building2,
  "sys-tags": Settings,
};

export function useV2AdaptedTabs(): {
  tabs: V2TabEntry[];
  activeTabId: string;
  handleTabSelect: (instanceId: string) => void;
  handleTabClose: (instanceId: string) => void;
} {
  const { openTabs, currentInstanceId, navigate, closeTab } = useAppStore();
  const t = useT();

  const tabLabel = (key: PageKey): string => {
    switch (key) {
      case "dashboard":
        return t("nav.items.dashboard", "Tổng quan");
      case "erp-sales-orders":
        return t("nav.items.erpSalesOrders", "Đơn bán hàng");
      case "erp-customers":
        return t("nav.items.customers", "Khách hàng");
      case "after-sales":
        return t("nav.items.afterSales", "Sau bán hàng");
      case "purchasing":
        return t("nav.items.purchasing", "Mua hàng");
      case "erp-suppliers":
        return t("nav.items.suppliers", "Nhà cung cấp");
      case "inventory-dashboard":
        return t("nav.items.inventoryDashboard", "Tổng quan kho");
      case "erp-inventory-stock":
        return t("nav.items.erpInventoryStock", "Tồn kho");
      case "erp-inventory-tracking":
        return t("nav.items.erpInventoryTrackingGroup", "Theo dõi hàng hoá");
      case "erp-inventory-vouchers":
        return t("nav.items.erpInventoryVouchers", "Chứng từ kho");
      case "erp-bom":
        return t("nav.items.erpBom", "Định mức BOM");
      case "erp-production":
        return t("nav.items.erpProduction", "Lệnh sản xuất");
      case "erp-finished-goods":
        return t("nav.items.erpFinishedGoods", "Thành phẩm");
      case "garage-dashboard":
      case "garage-cases":
        return t("nav.items.garageCases", "Hoạt động garage");
      case "garage-cashflow":
        return t("nav.items.garageCashflow", "Thu chi garage");
      case "garage-debts":
        return t("nav.items.garageDebts", "Công nợ garage");
      case "garage-opex":
        return t("nav.items.garageOpex", "Chi phí vận hành Garage");
      case "vinfast-parts-stock":
        return t("nav.items.vinfastPartsGroup", "Phụ tùng Vinfast");
      case "cashflow":
        return t("nav.items.cashflow", "Dòng tiền");
      case "erp-invoices":
        return t("nav.items.invoices", "Hóa đơn");
      case "invoice-debts":
        return t("nav.items.debts", "Công nợ");
      case "opex":
        return t("nav.items.opex", "Chi phí vận hành");
      case "journal-entry":
        return t("nav.items.journal", "Nhật ký chung");
      case "settings-accounts":
        return t("nav.items.accounts", "Hệ thống tài khoản");
      case "erp-employees":
        return t("nav.items.erpEmployees", "Nhân sự");
      case "attachments":
        return t("nav.items.attachments", "Tệp đính kèm");
      case "email-inbox":
        return t("nav.items.emailInbox", "Hòm thư");
      case "erp-users":
        return t("nav.items.users", "Người dùng");
      case "erp-permissions-core":
        return t("nav.items.phanquyen", "Phân quyền");
      case "erp-activity-logs":
        return t("nav.items.activitylog", "Nhật ký hoạt động");
      case "settings-branch":
        return t("thietlap.tabs.chi-nhanh", "Chi nhánh");
      case "sys-tags":
        return t("nav.items.sysTags", "Tags");
      default:
        return key;
    }
  };

  const tabs: V2TabEntry[] = useMemo(() => {
    return openTabs.map((tab) => {
      const isStatic = Boolean(STATIC_TABS[tab.pageKey]);
      const baseLabel = tabLabel(tab.pageKey);
      const label = tab.instanceIndex === 2 ? `${baseLabel} #2` : baseLabel;
      const Icon = TAB_ICONS[tab.pageKey] || FileText;

      return {
        id: tab.instanceId,
        label,
        icon: Icon,
        isClosable: !isStatic,
      };
    });
  }, [openTabs, t]);

  const handleTabSelect = (instanceId: string) => {
    const target = openTabs.find((t) => t.instanceId === instanceId);
    if (target) {
      navigate(target.pageKey, target.instanceIndex);
    }
  };

  const handleTabClose = (instanceId: string) => {
    closeTab(instanceId);
  };

  return {
    tabs,
    activeTabId: currentInstanceId,
    handleTabSelect,
    handleTabClose,
  };
}
