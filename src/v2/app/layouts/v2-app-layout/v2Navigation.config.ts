import {
  LayoutDashboard,
  Boxes,
  Users,
  Shield,
  FileText,
  Building2,
  Package,
  PackageCheck,
  Layers,
  Factory,
  ReceiptText,
  Wallet,
  Settings,
} from "lucide-react";

export interface RawNavDef {
  id: string;
  sectionId: string;
  labelKey: string;
  fallback: string;
  icon: any;
  href: string;
}

export interface RawSectionDef {
  id: string;
  labelKey: string;
  fallback: string;
}

export const NAV_DEFS: RawNavDef[] = [
  {
    id: "dashboard",
    sectionId: "overview",
    labelKey: "v2.nav.items.dashboard",
    fallback: "Tổng quan",
    icon: LayoutDashboard,
    href: "/v2",
  },
  {
    id: "sales-orders",
    sectionId: "sales",
    labelKey: "v2.nav.items.erpSalesOrders",
    fallback: "Đơn bán hàng",
    icon: Boxes,
    href: "/v2/sales-orders",
  },
  {
    id: "customers",
    sectionId: "sales",
    labelKey: "v2.nav.items.customers",
    fallback: "Khách hàng",
    icon: Users,
    href: "/v2/customers",
  },
  {
    id: "after-sales",
    sectionId: "sales",
    labelKey: "v2.nav.items.afterSales",
    fallback: "Sau bán hàng & Bảo hành",
    icon: Shield,
    href: "/v2/after-sales",
  },
  {
    id: "purchasing-orders",
    sectionId: "purchasing",
    labelKey: "v2.nav.items.purchasing",
    fallback: "Mua hàng",
    icon: FileText,
    href: "/v2/purchasing",
  },
  {
    id: "suppliers",
    sectionId: "purchasing",
    labelKey: "v2.nav.items.suppliers",
    fallback: "Nhà cung cấp",
    icon: Building2,
    href: "/v2/suppliers",
  },
  {
    id: "inventory-stock",
    sectionId: "inventory",
    labelKey: "v2.nav.items.erpInventoryStock",
    fallback: "Tồn kho thực tế",
    icon: Package,
    href: "/v2/inventory",
  },
  {
    id: "inventory-vouchers",
    sectionId: "inventory",
    labelKey: "v2.nav.items.erpInventoryVouchers",
    fallback: "Chứng từ kho",
    icon: PackageCheck,
    href: "/v2/inventory-vouchers",
  },
  {
    id: "bom",
    sectionId: "manufacturing",
    labelKey: "v2.nav.items.erpBom",
    fallback: "Định mức BOM",
    icon: Layers,
    href: "/v2/bom",
  },
  {
    id: "production",
    sectionId: "manufacturing",
    labelKey: "v2.nav.items.erpProduction",
    fallback: "Lệnh sản xuất",
    icon: Factory,
    href: "/v2/production",
  },
  {
    id: "invoices",
    sectionId: "accounting",
    labelKey: "v2.nav.items.erpInvoices",
    fallback: "Hóa đơn điện tử",
    icon: ReceiptText,
    href: "/v2/invoices",
  },
  {
    id: "cashflow",
    sectionId: "accounting",
    labelKey: "v2.nav.items.cashflow",
    fallback: "Sổ quỹ & Sao kê",
    icon: Wallet,
    href: "/v2/cashflow",
  },
  {
    id: "settings-app",
    sectionId: "settings",
    labelKey: "v2.nav.items.catalog",
    fallback: "Cài đặt chung",
    icon: Settings,
    href: "/v2/settings",
  },
  // plop:v2-nav-items
];

export const SECTION_DEFS: RawSectionDef[] = [
  { id: "overview", labelKey: "v2.nav.sections.admin", fallback: "TỔNG QUAN" },
  { id: "sales", labelKey: "v2.nav.sections.sales", fallback: "BÁN HÀNG" },
  {
    id: "purchasing",
    labelKey: "v2.nav.sections.purchasing",
    fallback: "MUA HÀNG",
  },
  {
    id: "inventory",
    labelKey: "v2.nav.sections.inventory",
    fallback: "KHO VẬN",
  },
  {
    id: "manufacturing",
    labelKey: "v2.nav.sections.manufacturing",
    fallback: "SẢN XUẤT",
  },
  {
    id: "accounting",
    labelKey: "v2.nav.sections.accounting",
    fallback: "KẾ TOÁN & DÒNG TIỀN",
  },
  { id: "settings", labelKey: "v2.nav.sections.settings", fallback: "CÀI ĐẶT" },
];
