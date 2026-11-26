import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Home } from "lucide-react";
import { useV2MobileNav } from "./useV2MobileNav";
import { useV2MobileNavStore } from "@/v2/shared/stores/useV2MobileNavStore";
import type { V2SidebarSectionData } from "@/v2/shared/components";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2PermissionChecker: () => () => true,
}));

describe("useV2MobileNav hook", () => {
  beforeEach(() => {
    useV2MobileNavStore.setState({ pinnedIds: [] });
  });

  it("khởi tạo state mặc định và mở/đóng catalog", () => {
    const { result } = renderHook(() => useV2MobileNav());

    expect(result.current.catalogOpen).toBe(false);
    expect(result.current.isCustomizing).toBe(false);

    act(() => {
      result.current.setCatalogOpen(true);
    });
    expect(result.current.catalogOpen).toBe(true);

    act(() => {
      result.current.closeCatalog();
    });
    expect(result.current.catalogOpen).toBe(false);
  });

  it("chuyển hướng catalog khi bấm Tất cả", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useV2MobileNav({ onNavigate }));

    act(() => {
      result.current.handleMobileNavigate(result.current.allMenuItem);
    });

    expect(result.current.catalogOpen).toBe(true);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("cho phép toggle mục lối tắt", () => {
    const { result } = renderHook(() => useV2MobileNav());

    const firstId = result.current.currentSelectedIds[0];
    act(() => {
      result.current.handleToggleItem(firstId);
    });

    expect(result.current.currentSelectedIds.includes(firstId)).toBe(false);
  });

  it("tự động dọn dẹp pinnedIds chỉ chứa toàn dashboard báo cáo cũ", () => {
    useV2MobileNavStore.setState({
      pinnedIds: [
        "sales-report-dashboard",
        "purchasing-report-dashboard",
        "inventory-dashboard",
      ],
    });

    const { result } = renderHook(() => useV2MobileNav());

    // Không dùng danh sách dashboard cũ mà tự động fallback về các mục nghiệp vụ chuẩn
    expect(result.current.currentSelectedIds).not.toContain(
      "sales-report-dashboard",
    );
    expect(result.current.currentSelectedIds.length).toBeLessThanOrEqual(6);
  });

  it("ẩn bottom nav khi chỉ có <= 1 menu item hợp lệ", () => {
    const oneSection: V2SidebarSectionData[] = [
      {
        id: "sec-1",
        label: "Chính",
        items: [{ id: "dashboard", label: "Tổng quan", icon: Home, href: "/" }],
      },
    ];
    const { result } = renderHook(() =>
      useV2MobileNav({ sections: oneSection }),
    );

    expect(result.current.shouldShowBottomNav).toBe(false);
    expect(result.current.shouldShowCenterHero).toBe(false);
    expect(result.current.bottomNavItems).toHaveLength(1);
  });

  it("hiển thị đủ 2..6 menu items và ẩn nút giữa khi <= 6 items", () => {
    useV2MobileNavStore.setState({ pinnedIds: ["page-1", "page-2"] });
    const sixItems = Array.from({ length: 6 }, (_, i) => ({
      id: `page-${i + 1}`,
      label: `Trang ${i + 1}`,
      icon: Home,
      href: `/page-${i + 1}`,
    }));
    const sections: V2SidebarSectionData[] = [
      { id: "sec-6", label: "Nghiệp vụ", items: sixItems },
    ];

    const { result } = renderHook(() => useV2MobileNav({ sections }));

    expect(result.current.shouldShowBottomNav).toBe(true);
    expect(result.current.shouldShowCenterHero).toBe(false);
    expect(result.current.bottomNavItems).toHaveLength(6);
    expect(
      result.current.effectiveNavItems.some((i) => i.id === "catalog"),
    ).toBe(false);
  });

  it("bật nút giữa và catalog khi có > 6 menu items hoặc truyền navItems > 6", () => {
    const sevenItems = Array.from({ length: 7 }, (_, i) => ({
      id: `page-${i + 1}`,
      label: `Trang ${i + 1}`,
      icon: Home,
      href: `/page-${i + 1}`,
    }));
    const { result } = renderHook(() =>
      useV2MobileNav({ navItems: sevenItems }),
    );

    expect(result.current.shouldShowBottomNav).toBe(true);
    expect(result.current.shouldShowCenterHero).toBe(true);
    expect(result.current.bottomNavItems).toHaveLength(7);
  });

  it("tìm kiếm và nhận diện activeId cho các mục nằm trong children của nhóm con", () => {
    const sectionsWithChildren: V2SidebarSectionData[] = [
      {
        id: "sec-settings",
        label: "HỆ THỐNG",
        items: [
          {
            id: "sub-access-control",
            label: "Quản lý truy cập",
            icon: Home,
            href: "/users-management",
            children: [
              {
                id: "users-management",
                label: "Quản lý người dùng",
                icon: Home,
                href: "/users-management",
              },
              {
                id: "permission",
                label: "Phân quyền & Vai trò",
                icon: Home,
                href: "/permission",
              },
            ],
          },
          ...Array.from({ length: 5 }, (_, i) => ({
            id: `extra-${i + 1}`,
            label: `Khác ${i + 1}`,
            icon: Home,
            href: `/extra-${i + 1}`,
          })),
        ],
      },
    ];

    const { result } = renderHook(() =>
      useV2MobileNav({
        sections: sectionsWithChildren,
        activeNavId: "permission",
      }),
    );

    act(() => {
      result.current.setSearchQuery("Phân quyền");
    });

    expect(result.current.filteredSections).toHaveLength(1);
    expect(result.current.filteredSections[0].items[0].children).toHaveLength(
      1,
    );
    expect(result.current.filteredSections[0].items[0].children?.[0].id).toBe(
      "permission",
    );
  });
});
