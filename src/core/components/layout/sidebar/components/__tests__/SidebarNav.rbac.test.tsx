import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarNav } from "../SidebarNav";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    employee: { email: "garage@greenwayauto.vn" },
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (k: string) => {
    const map: Record<string, string> = {
      "nav.items.dashboard": "Tổng quan",
      "nav.sections.admin": "QUẢN TRỊ",
      "nav.items.attachments": "Quản lý tài liệu",
      "nav.items.erpEmployees": "Nhân sự",
      "nav.sections.garage": "DỊCH VỤ GARAGE",
      "nav.items.garageCases": "Vụ việc Garage",
    };
    return map[k] ?? k;
  },
}));

describe("SidebarNav RBAC Guard", () => {
  const mockNavTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides Dashboard and Admin/Attachments for garage user lacking permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      if (resource === ErpResource.GARAGE) return true;
      return false;
    });

    render(
      <SidebarNav c={false} currentPage="garage-cases" navTo={mockNavTo} />,
    );

    expect(screen.queryByText("Tổng quan")).toBeNull();
    expect(screen.queryByText("QUẢN TRỊ")).toBeNull();
    expect(screen.queryByText("Quản lý tài liệu")).toBeNull();
  });

  it("displays Dashboard and Attachments when user has explicit permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      if (resource === ErpResource.DASHBOARD) return true;
      if (resource === ErpResource.ATTACHMENTS) return true;
      return false;
    });

    render(<SidebarNav c={false} currentPage="dashboard" navTo={mockNavTo} />);

    expect(screen.getByText("Tổng quan")).toBeDefined();
    expect(screen.getByText("QUẢN TRỊ")).toBeDefined();
    expect(screen.getByText("Quản lý tài liệu")).toBeDefined();
  });
});
