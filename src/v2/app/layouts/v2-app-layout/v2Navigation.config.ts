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
    labelKey: "nav.items.dashboard",
    fallback: "Tổng quan",
    icon: LayoutDashboard,
    href: "/v2",
  },
  {
    id: "sales-orders",
    sectionId: "sales",
    labelKey: "nav.items.erpSalesOrders",
    fallback: "Đơn bán hàng",
    icon: Boxes,
    href: "/v2/sales-orders",
  },
  {
    id: "customers",
    sectionId: "sales",
    labelKey: "nav.items.customers",
    fallback: "Khách hàng",
    icon: Users,
    href: "/v2/customers",
  },
  {
    id: "after-sales",
    sectionId: "sales",
    labelKey: "nav.items.afterSales",
    fallback: "Sau bán hàng & Bảo hành",
    icon: Shield,
    href: "/v2/after-sales",
  },
  {
    id: "purchasing-orders",
    sectionId: "purchasing",
    labelKey: "nav.items.purchasing",
    fallback: "Mua hàng",
    icon: FileText,
    href: "/v2/purchasing",
  },
  {
    id: "suppliers",
    sectionId: "purchasing",
    labelKey: "nav.items.suppliers",
    fallback: "Nhà cung cấp",
    icon: Building2,
    href: "/v2/suppliers",
  },
  {
    id: "inventory-stock",
    sectionId: "inventory",
    labelKey: "nav.items.erpInventoryStock",
    fallback: "Tồn kho thực tế",
    icon: Package,
    href: "/v2/inventory",
  },
  {
    id: "inventory-vouchers",
    sectionId: "inventory",
    labelKey: "nav.items.erpInventoryVouchers",
    fallback: "Chứng từ kho",
    icon: PackageCheck,
    href: "/v2/inventory-vouchers",
  },
  {
    id: "bom",
    sectionId: "manufacturing",
    labelKey: "nav.items.erpBom",
    fallback: "Định mức BOM",
    icon: Layers,
    href: "/v2/bom",
  },
  {
    id: "production",
    sectionId: "manufacturing",
    labelKey: "nav.items.erpProduction",
    fallback: "Lệnh sản xuất",
    icon: Factory,
    href: "/v2/production",
  },
  {
    id: "invoices",
    sectionId: "accounting",
    labelKey: "nav.items.erpInvoices",
    fallback: "Hóa đơn điện tử",
    icon: ReceiptText,
    href: "/v2/invoices",
  },
  {
    id: "cashflow",
    sectionId: "accounting",
    labelKey: "nav.items.cashflow",
    fallback: "Sổ quỹ & Sao kê",
    icon: Wallet,
    href: "/v2/cashflow",
  },
  {
    id: "settings-app",
    sectionId: "settings",
    labelKey: "nav.items.catalog",
    fallback: "Cài đặt chung",
    icon: Settings,
    href: "/v2/settings",
  },
];

export const SECTION_DEFS: RawSectionDef[] = [
  { id: "overview", labelKey: "nav.sections.admin", fallback: "TỔNG QUAN" },
  { id: "sales", labelKey: "nav.sections.sales", fallback: "BÁN HÀNG" },
  {
    id: "purchasing",
    labelKey: "nav.sections.purchasing",
    fallback: "MUA HÀNG",
  },
  { id: "inventory", labelKey: "nav.sections.inventory", fallback: "KHO VẬN" },
  {
    id: "manufacturing",
    labelKey: "nav.sections.manufacturing",
    fallback: "SẢN XUẤT",
  },
  {
    id: "accounting",
    labelKey: "nav.sections.accounting",
    fallback: "KẾ TOÁN & DÒNG TIỀN",
  },
  { id: "settings", labelKey: "nav.sections.settings", fallback: "CÀI ĐẶT" },
];
