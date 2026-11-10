import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createBusinessPartnerKeys } from "../api/queries/businessPartnerKeys";
import type { BusinessPartnerApi } from "../api/businessPartnerApi.type";
import type { BusinessPartnerModuleConfig } from "../businessPartners.config.type";
import { useBusinessPartnerListController } from "./useBusinessPartnerListController";

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: ({ action }: { action: string }) => action !== "delete",
}));

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

const mockConfig: BusinessPartnerModuleConfig = {
  api: {} as BusinessPartnerApi,
  keys: createBusinessPartnerKeys(["v2-test-bp-list"]),
  tableId: "business-partners-customers-table",
  partnerType: "CUSTOMER",
  permissionCollection: "business_partners",
  requiredFields: ["name"],
  viewVisibility: {
    overview: { code: true, name: true, phone: true },
    all: { code: true, name: true, phone: true, address: true },
  },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useBusinessPartnerListController", () => {
  it("đọc quyền theo collection cấu hình và quản lý mở drawer", () => {
    const { result } = renderHook(
      () => useBusinessPartnerListController(mockConfig),
      { wrapper },
    );

    expect(result.current.canCreate).toBe(true);
    expect(result.current.canUpdate).toBe(true);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.drawer).toBeNull();

    act(() => result.current.open("cust-1", "view"));
    expect(result.current.drawer).toEqual({ id: "cust-1", mode: "view" });

    act(() => result.current.setDrawer(null));
    expect(result.current.drawer).toBeNull();
  });

  it("chuyển đổi view modes và thiết lập deleteTarget", () => {
    const { result } = renderHook(
      () => useBusinessPartnerListController(mockConfig),
      { wrapper },
    );

    act(() => result.current.selectView("all"));
    expect(result.current.view).toBe("all");

    const sample = { id: "bp-1", code: "KH-001", name: "Cty A" } as any;
    act(() => result.current.setDeleteTarget(sample));
    expect(result.current.deleteTarget).toEqual(sample);
  });
});
