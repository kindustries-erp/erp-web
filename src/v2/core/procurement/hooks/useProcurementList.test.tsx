import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProcurementList } from "./useProcurementList";
import type { ProcurementListConfig } from "./procurementListConfig.type";

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
const config = {
  api: { remove: vi.fn() },
  queryKey: "q",
  permissionCollection: "c",
  availableActions: () => [],
  isEditable: () => true,
  rowLabel: (r: Row) => r.id,
} as unknown as ProcurementListConfig<Row>;

const renderList = () => {
  const client = new QueryClient();
  return renderHook(() => useProcurementList<Row>(config), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};

describe("useProcurementList — trạng thái drawer", () => {
  it("openView mở drawer ở chế độ xem", () => {
    const { result } = renderList();
    act(() => result.current.openView("p1"));
    expect(result.current.drawer).toEqual({ id: "p1", mode: "view" });
  });

  it("openCreate mở drawer tạo mới ở chế độ sửa", () => {
    const { result } = renderList();
    act(() => result.current.openCreate());
    expect(result.current.drawer).toEqual({ id: null, mode: "edit" });
  });

  it("openSaved (sau khi lưu) mở lại bản ghi ở chế độ xem", () => {
    const { result } = renderList();
    act(() => result.current.openCreate());
    act(() => result.current.openSaved("p9"));
    expect(result.current.drawer).toEqual({ id: "p9", mode: "view" });
  });

  it("closeDrawer đóng drawer", () => {
    const { result } = renderList();
    act(() => result.current.openView("p1"));
    act(() => result.current.closeDrawer());
    expect(result.current.drawer).toBeNull();
  });
});
