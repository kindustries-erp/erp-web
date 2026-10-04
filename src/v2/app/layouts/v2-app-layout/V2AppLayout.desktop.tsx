import * as React from "react";
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
import {
  V2Sidebar,
  type V2SidebarSectionData,
  type V2SidebarNavItem,
} from "@/v2/shared/components/organisms/v2-sidebar";
import { V2RightPanel } from "@/v2/shared/components/organisms/v2-right-panel";
import { V2AppLayoutProps } from "./V2AppLayout.type";

export const DEFAULT_V2_NAV_ITEMS: V2SidebarNavItem[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard, href: "/v2" },
  {
    id: "sales-orders",
    label: "Đơn bán hàng",
    icon: Boxes,
    href: "/v2/sales-orders",
  },
  {
    id: "purchasing",
    label: "Mua hàng",
    icon: FileText,
    href: "/v2/purchasing",
  },
  { id: "inventory", label: "Kho vận", icon: Package, href: "/v2/inventory" },
  { id: "settings", label: "Cài đặt", icon: Settings, href: "/v2/settings" },
];

export const DEFAULT_V2_SECTIONS: V2SidebarSectionData[] = [
  {
    id: "overview",
    label: "TỔNG QUAN",
    items: [
      {
        id: "dashboard",
        label: "Tổng quan",
        icon: LayoutDashboard,
        href: "/v2",
      },
    ],
  },
  {
    id: "sales",
    label: "BÁN HÀNG",
    items: [
      {
        id: "sales-orders",
        label: "Đơn bán hàng",
        icon: Boxes,
        href: "/v2/sales-orders",
      },
      {
        id: "customers",
        label: "Khách hàng",
        icon: Users,
        href: "/v2/customers",
      },
      {
        id: "after-sales",
        label: "Sau bán hàng & Bảo hành",
        icon: Shield,
        href: "/v2/after-sales",
      },
    ],
  },
  {
    id: "purchasing",
    label: "MUA HÀNG",
    items: [
      {
        id: "purchasing-orders",
        label: "Mua hàng",
        icon: FileText,
        href: "/v2/purchasing",
      },
      {
        id: "suppliers",
        label: "Nhà cung cấp",
        icon: Building2,
        href: "/v2/suppliers",
      },
    ],
  },
  {
    id: "inventory",
    label: "KHO VẬN",
    items: [
      {
        id: "inventory-stock",
        label: "Tồn kho thực tế",
        icon: Package,
        href: "/v2/inventory",
      },
      {
        id: "inventory-vouchers",
        label: "Chứng từ kho",
        icon: PackageCheck,
        href: "/v2/inventory-vouchers",
      },
    ],
  },
  {
    id: "manufacturing",
    label: "SẢN XUẤT",
    items: [
      { id: "bom", label: "Định mức BOM", icon: Layers, href: "/v2/bom" },
      {
        id: "production",
        label: "Lệnh sản xuất",
        icon: Factory,
        href: "/v2/production",
      },
    ],
  },
  {
    id: "accounting",
    label: "KẾ TOÁN & DÒNG TIỀN",
    items: [
      {
        id: "invoices",
        label: "Hóa đơn điện tử",
        icon: ReceiptText,
        href: "/v2/invoices",
      },
      {
        id: "cashflow",
        label: "Sổ quỹ & Sao kê",
        icon: Wallet,
        href: "/v2/cashflow",
      },
    ],
  },
  {
    id: "settings",
    label: "CÀI ĐẶT",
    items: [
      {
        id: "settings-app",
        label: "Cài đặt chung",
        icon: Settings,
        href: "/v2/settings",
      },
    ],
  },
];

export const V2AppLayoutDesktop: React.FC<V2AppLayoutProps> = ({
  children,
  activeNavId = "dashboard",
  breadcrumbs = [{ label: "Tổng quan" }],
  userName = "Quản trị viên",
  branchName = "Chi nhánh chính",
  tenantName = "Liouni Ecosystem",
  sections,
  navItems,
  tabs,
  activeTabId,
  onNavigate,
  onTabSelect,
  onTabClose,
  onSearchClick,
  onBranchClick,
}) => {
  const fallbackTabs = React.useMemo(
    () => [
      {
        id: "dashboard",
        label: "Tổng quan",
        icon: LayoutDashboard,
        isClosable: false,
      },
    ],
    [],
  );

  return (
    <div
      data-testid="v2-app-layout-desktop"
      className="flex h-screen w-full overflow-hidden p-2 gap-2 bg-[#f4f4f4] dark:bg-background text-foreground select-none"
    >
      {/* Card 1: Sidebar floating card */}
      <V2Sidebar
        sections={sections ?? (navItems ? undefined : DEFAULT_V2_SECTIONS)}
        items={navItems}
        activeId={activeNavId}
        onNavigate={onNavigate}
        user={{
          displayName: userName,
          avatarInitials: userName
            ? userName.substring(0, 2).toUpperCase()
            : "AD",
          unreadCount: 0,
        }}
      />

      {/* Card 2: Right Panel floating card with Topbar, Content & TabBar */}
      <V2RightPanel
        breadcrumbs={breadcrumbs}
        branchName={branchName}
        companyName={tenantName}
        onSearchClick={onSearchClick}
        onBranchClick={onBranchClick}
        tabs={tabs ?? fallbackTabs}
        activeTabId={activeTabId ?? "dashboard"}
        onTabSelect={onTabSelect ?? (() => {})}
        onTabClose={onTabClose}
      >
        {children}
      </V2RightPanel>
    </div>
  );
};
