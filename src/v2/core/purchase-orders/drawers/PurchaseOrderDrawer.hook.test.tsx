import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createPurchaseOrderKeys } from "../api/purchaseOrderKeys";
import type { PurchaseOrderApi } from "../api/purchaseOrderApi.type";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import { emptyPurchaseOrderForm } from "../domain/purchaseOrder";
import { usePurchaseOrderDrawer } from "./PurchaseOrderDrawer.hook";

const dataState = vi.hoisted(() => ({
  current: {
    form: {} as Record<string, unknown>,
    initial: {} as Record<string, unknown>,
    setField: () => undefined,
    regenerateNo: () => undefined,
    creating: false,
    loading: false,
    loaded: true,
  },
}));

vi.mock("./PurchaseOrderDrawer.data.hook", () => ({
  usePurchaseOrderDrawerData: () => dataState.current,
}));
vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? "",
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const makeApi = () =>
  ({
    create: vi.fn().mockResolvedValue({ id: "new" }),
    update: vi.fn().mockResolvedValue({ id: "1" }),
    approve: vi.fn().mockResolvedValue({ id: "1" }),
    confirm: vi.fn().mockResolvedValue({ id: "1" }),
    cancel: vi.fn().mockResolvedValue({ id: "1" }),
    remove: vi.fn().mockResolvedValue({ id: "1" }),
  }) as unknown as PurchaseOrderApi;

const setStatus = (status: string, creating = false) => {
  const form = { ...emptyPurchaseOrderForm(), status };
  dataState.current = { ...dataState.current, form, initial: form, creating };
};

type DrawerProps = {
  api: PurchaseOrderApi;
  recordId: string | null;
  canUpdate: boolean;
};

/** Hook dưới test, đặt tên `use…` để truyền thẳng vào renderHook (đúng quy tắc hook) */
const useDrawerUnderTest = ({ api, recordId, canUpdate }: DrawerProps) =>
  usePurchaseOrderDrawer({
    config: {
      api,
      keys: createPurchaseOrderKeys(["v2-test-drawer"]),
      tableId: "t",
      permissionCollection: "c",
      requiredFields: ["orderDate"],
      viewVisibility: {},
    } as unknown as PurchaseOrderModuleConfig,
    state: { open: true, recordId, mode: "view", canUpdate, onClose: vi.fn() },
  });

const useDrawer = (
  api: PurchaseOrderApi,
  recordId: string | null,
  canUpdate = true,
) =>
  renderHook(useDrawerUnderTest, {
    wrapper,
    initialProps: { api, recordId, canUpdate },
  });

describe("usePurchaseOrderDrawer", () => {
  beforeEach(() => setStatus("DRAFT"));

  it("nháp: được duyệt, xác nhận, sửa; không được hủy", () => {
    const { result } = useDrawer(makeApi(), "p1");
    expect(result.current.canApprove).toBe(true);
    expect(result.current.canConfirm).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canCancel).toBe(false);
  });

  it("đã duyệt: không duyệt nữa, được xác nhận và hủy", () => {
    setStatus("APPROVED");
    const { result } = useDrawer(makeApi(), "p1");
    expect(result.current.canApprove).toBe(false);
    expect(result.current.canConfirm).toBe(true);
    expect(result.current.canCancel).toBe(true);
  });

  it("đã nhận đủ: không sửa, không hủy", () => {
    setStatus("RECEIVED");
    const { result } = useDrawer(makeApi(), "p1");
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canCancel).toBe(false);
  });

  it("không có quyền cập nhật thì mọi hành động ghi đều tắt", () => {
    const { result } = useDrawer(makeApi(), "p1", false);
    expect(result.current.canApprove).toBe(false);
    expect(result.current.canEdit).toBe(false);
  });

  it("tạo mới chưa có id: không có hành động duyệt, xác nhận, hủy", () => {
    setStatus("DRAFT", true);
    const { result } = useDrawer(makeApi(), null);
    expect(result.current.canApprove).toBe(false);
    expect(result.current.canConfirm).toBe(false);
  });

  it("thiếu ngày đặt thì chặn lưu và không gọi API", () => {
    const api = makeApi();
    setStatus("DRAFT", true);
    dataState.current = {
      ...dataState.current,
      form: { ...emptyPurchaseOrderForm(), orderDate: "" },
    };
    const { result } = useDrawer(api, null);
    act(() => result.current.saveDraft());
    expect(result.current.errorField).toBe("orderDate");
    expect(api.create).not.toHaveBeenCalled();
  });

  it("lưu và duyệt chỉ bật khi còn nháp và có quyền cập nhật", () => {
    const { result } = useDrawer(makeApi(), "p1");
    expect(result.current.canSaveAndApprove).toBe(true);

    setStatus("APPROVED");
    const approved = useDrawer(makeApi(), "p1");
    expect(approved.result.current.canSaveAndApprove).toBe(false);

    setStatus("DRAFT");
    const noPermission = useDrawer(makeApi(), "p1", false);
    expect(noPermission.result.current.canSaveAndApprove).toBe(false);
  });

  it("lưu và duyệt thiếu ngày đặt thì chặn và không gọi API", () => {
    const api = makeApi();
    setStatus("DRAFT", true);
    dataState.current = {
      ...dataState.current,
      form: { ...emptyPurchaseOrderForm(), orderDate: "" },
    };
    const { result } = useDrawer(api, null);
    act(() => result.current.saveAndApproveDraft());
    expect(result.current.errorField).toBe("orderDate");
    expect(api.create).not.toHaveBeenCalled();
    expect(api.approve).not.toHaveBeenCalled();
  });
});
