import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Users } from "lucide-react";
import { useV2AdminNav } from "./useV2AdminNav";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_k: string, fallback: string) => fallback,
    locale: "vi",
  }),
}));

describe("useV2AdminNav hook", () => {
  it("trả về các giá trị metadata mặc định chuẩn", () => {
    const { result } = renderHook(() => useV2AdminNav());

    expect(result.current.effectiveAppName).toBe("ERP Admin");
    expect(result.current.effectiveTenantName).toBe("Enterprise Ecosystem");
    expect(result.current.effectiveUserName).toBe("Quản trị viên");
    expect(result.current.effectiveBranchName).toBe("Chi nhánh chính");
    expect(result.current.fallbackBreadcrumbs).toEqual([
      { label: "Tổng quan Quản trị" },
    ]);
    expect(result.current.dynamicSections.length).toBeGreaterThan(0);
  });

  it("ưu tiên sử dụng props do người dùng truyền vào", () => {
    const customSections = [
      {
        id: "custom-sec",
        label: "Tùy chỉnh",
        items: [
          {
            id: "custom-item",
            label: "Mục test",
            icon: Users,
            href: "/test",
          },
        ],
      },
    ];

    const { result } = renderHook(() =>
      useV2AdminNav({
        appName: "Klotus Admin",
        tenantName: "Klotus Ecosystem",
        userName: "Super Admin",
        branchName: "Hà Nội",
        sections: customSections,
      }),
    );

    expect(result.current.effectiveAppName).toBe("Klotus Admin");
    expect(result.current.effectiveTenantName).toBe("Klotus Ecosystem");
    expect(result.current.effectiveUserName).toBe("Super Admin");
    expect(result.current.effectiveBranchName).toBe("Hà Nội");
    expect(result.current.dynamicSections).toEqual(customSections);
  });

  it("gọi onNavigate khi handleNavigate hoặc handleMobileNavigate được kích hoạt", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useV2AdminNav({ onNavigate }));

    act(() => {
      result.current.handleNavigate({
        id: "admin-users",
        label: "Người dùng",
        icon: Users,
        href: "/admin-users",
      });
    });

    expect(onNavigate).toHaveBeenCalledWith({
      id: "admin-users",
      label: "Người dùng",
      icon: Users,
      href: "/admin-users",
    });

    act(() => {
      result.current.handleMobileNavigate({
        id: "admin-dashboard",
      });
    });

    expect(onNavigate).toHaveBeenCalledWith({
      id: "admin-dashboard",
      label: "admin-dashboard",
      href: "#admin-dashboard",
      icon: undefined,
    });
  });
});
