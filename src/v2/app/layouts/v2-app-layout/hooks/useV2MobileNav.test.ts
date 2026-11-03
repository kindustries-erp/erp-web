import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useV2MobileNav } from "./useV2MobileNav";
import { useV2MobileNavStore } from "@/v2/shared/stores/useV2MobileNavStore";

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

    // Không dùng danh sách dashboard cũ mà tự động fallback về 4 mục nghiệp vụ chuẩn
    expect(result.current.currentSelectedIds).not.toContain(
      "sales-report-dashboard",
    );
    expect(result.current.currentSelectedIds.length).toBeLessThanOrEqual(4);
  });
});
