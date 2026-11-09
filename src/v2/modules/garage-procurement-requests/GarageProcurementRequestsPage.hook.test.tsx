import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGarageProcurementActiveTab } from "./GarageProcurementRequestsPage.hook";

let currentSearch = "";
const updateParams = vi.fn();

vi.mock("@/v2/shared/hooks/useV2SearchParams", () => ({
  useV2SearchParams: () => new URLSearchParams(currentSearch),
}));
vi.mock("@/v2/shared/utils/v2Url", () => ({
  updateV2SearchParams: (...args: unknown[]) => updateParams(...args),
}));
vi.mock("@/v2/core/procurement", () => ({
  getOrderStatusOptions: () => [],
  getRequestStatusOptions: () => [],
  useProcurementDeepLink: () => undefined,
  useProcurementListTabState: () => ({}),
}));
vi.mock("./garageProcurementRequests.config", () => ({
  garageProcurementRequestsConfig: {},
  garageProcurementRequestsDisplay: {},
}));
vi.mock("../garage-procurement-orders/garageProcurementOrders.config", () => ({
  garageProcurementOrdersConfig: {},
  garageProcurementOrdersDisplay: {},
}));

describe("useGarageProcurementActiveTab", () => {
  beforeEach(() => {
    updateParams.mockClear();
  });

  it("lấy tab từ URL lúc mở trang", () => {
    currentSearch = "tab=orders";
    const { result } = renderHook(() =>
      useGarageProcurementActiveTab("requests"),
    );
    expect(result.current[0]).toBe("orders");
  });

  it("theo dõi URL: khi ?tab= đổi lúc đang mở trang thì chuyển tab theo", () => {
    currentSearch = "tab=requests";
    const { result, rerender } = renderHook(() =>
      useGarageProcurementActiveTab("orders"),
    );
    expect(result.current[0]).toBe("requests");

    currentSearch = "tab=orders";
    rerender();
    expect(result.current[0]).toBe("orders");
  });

  it("thiếu ?tab= thì đặt về requests trên URL", () => {
    currentSearch = "";
    renderHook(() => useGarageProcurementActiveTab("requests"));
    expect(updateParams).toHaveBeenCalledTimes(1);
  });

  it("tab không hợp lệ dùng mặc định", () => {
    currentSearch = "tab=xyz";
    const { result } = renderHook(() =>
      useGarageProcurementActiveTab("orders"),
    );
    expect(result.current[0]).toBe("orders");
  });
});
