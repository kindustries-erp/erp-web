import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import {
  portalConfigKey,
  toPortalConfigView,
  usePortalConfigQuery,
} from "./usePortalConfigQuery";

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: { getPortalConfig: vi.fn() },
}));

const wrapperFor = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("toPortalConfigView", () => {
  it("ưu tiên hasToken từ API mới", () => {
    expect(toPortalConfigView({ hasToken: true, token: "" }).hasToken).toBe(
      true,
    );
  });

  it("rơi về token khi API cũ chưa có hasToken", () => {
    expect(toPortalConfigView({ token: "abc" }).hasToken).toBe(true);
    expect(toPortalConfigView({ token: "" }).hasToken).toBe(false);
  });

  it("không giữ lại token thô trong kết quả", () => {
    const view = toPortalConfigView({ token: "secret", cookies: "c" });
    expect(JSON.stringify(view)).not.toContain("secret");
  });
});

describe("usePortalConfigQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("đọc cấu hình qua query key dùng chung", async () => {
    vi.mocked(erpInvoicesCoreApi.getPortalConfig).mockResolvedValue({
      hasToken: true,
      hasPassword: true,
      username: "0318334886",
    });

    const { result } = renderHook(() => usePortalConfigQuery(), {
      wrapper: wrapperFor(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      hasToken: true,
      hasPassword: true,
      username: "0318334886",
    });
    expect(portalConfigKey).toEqual(["erp-invoices", "portal-config"]);
  });

  it("không gọi API khi enabled = false", () => {
    renderHook(() => usePortalConfigQuery(false), { wrapper: wrapperFor() });
    expect(erpInvoicesCoreApi.getPortalConfig).not.toHaveBeenCalled();
  });
});
