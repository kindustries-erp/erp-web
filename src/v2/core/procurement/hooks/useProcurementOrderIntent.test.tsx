import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProcurementList } from "./useProcurementList";
import type { ProcurementListConfig } from "./procurementListConfig.type";
import { useProcurementIntentStore } from "../procurement.intent";

vi.mock("@/v2/shared/hooks/useV2HasPermission", () => ({
  useV2HasPermission: () => true,
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("./useProcurementPurge", () => ({
  useProcurementPurge: () => ({
    purgeActions: () => [],
    purgeTarget: null,
    closePurge: vi.fn(),
    confirmPurge: vi.fn(),
    isPurging: false,
  }),
}));
vi.mock("./useProcurementTransition", () => ({
  useProcurementTransition: () => ({
    transition: { mutate: vi.fn(), isPending: false },
    remove: { mutate: vi.fn(), isPending: false },
  }),
}));

type Row = { id: string };

/** Danh sách đề nghị: có poHref, không có requestApi (giống cấu hình Garage) */
const requestsConfig = {
  api: { remove: vi.fn() },
  queryKey: "requests",
  permissionCollection: "garage_procurement_requests",
  poHref: "/garage-procurement?tab=orders",
  availableActions: () => [],
  isEditable: () => true,
  rowLabel: (r: Row) => r.id,
} as unknown as ProcurementListConfig<Row>;

/** Danh sách đơn mua: có requestApi để đọc đề nghị điền sẵn */
const ordersConfig = {
  api: { remove: vi.fn() },
  queryKey: "orders",
  permissionCollection: "garage_procurement_orders",
  requestApi: { get: vi.fn(), poDraft: vi.fn(), list: vi.fn() },
  availableActions: () => [],
  isEditable: () => true,
  rowLabel: (r: Row) => r.id,
} as unknown as ProcurementListConfig<Row>;

const renderBoth = () => {
  const client = new QueryClient();
  return renderHook(
    () => ({
      requests: useProcurementList<Row>(requestsConfig),
      orders: useProcurementList<Row>(ordersConfig),
    }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );
};

describe("ý định lập đơn mua từ đề nghị (hai danh sách cùng trang)", () => {
  beforeEach(() => {
    useProcurementIntentStore.getState().setPendingRequestId(null);
  });

  it("danh sách đề nghị không nuốt ý định: drawer đơn mua mở với fromRequestId", () => {
    useProcurementIntentStore.getState().setPendingRequestId("pr-1");
    const { result } = renderBoth();
    expect(result.current.orders.drawer).toEqual({
      id: null,
      mode: "edit",
      fromRequestId: "pr-1",
    });
    expect(result.current.requests.drawer).toBeNull();
  });

  it("nếu chỉ có danh sách đề nghị thì ý định còn nguyên, không mở drawer đề nghị", () => {
    useProcurementIntentStore.getState().setPendingRequestId("pr-2");
    const client = new QueryClient();
    const { result } = renderHook(
      () => useProcurementList<Row>(requestsConfig),
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );
    expect(result.current.drawer).toBeNull();
    expect(useProcurementIntentStore.getState().pendingRequestId).toBe("pr-2");
  });

  it("orderFromRequest từ danh sách đề nghị đóng drawer đề nghị đang mở và đặt ý định", () => {
    const { result } = renderBoth();
    act(() => result.current.requests.openView("pr-3"));
    expect(result.current.requests.drawer).toEqual({
      id: "pr-3",
      mode: "view",
    });

    const pushSpy = vi.spyOn(window.history, "pushState");
    act(() => result.current.requests.orderFromRequest({ id: "pr-3" } as Row));

    // Danh sách đơn mua nhận ý định ngay, nên drawer đề nghị đóng và drawer đơn mua mở với pr-3
    expect(result.current.requests.drawer).toBeNull();
    expect(result.current.orders.drawer).toEqual({
      id: null,
      mode: "edit",
      fromRequestId: "pr-3",
    });
    expect(useProcurementIntentStore.getState().pendingRequestId).toBeNull();
    expect(pushSpy).toHaveBeenCalledWith(
      null,
      "",
      "/garage-procurement?tab=orders",
    );
    pushSpy.mockRestore();
  });
});
