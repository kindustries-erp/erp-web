import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGoodsReceiptKeys } from "../api/goodsReceiptKeys";
import { GoodsReceiptStatus } from "../domain/goodsReceipt";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import { useGoodsReceiptDrawer } from "./GoodsReceiptDrawer.hook";

const dataState = vi.hoisted(() => ({
  current: {
    form: {} as Record<string, unknown>,
    initial: {} as Record<string, unknown>,
    setField: () => undefined,
    resetForm: () => undefined,
    regenerateCode: () => undefined,
    creating: false,
    loading: false,
    loaded: false,
  },
}));

vi.mock("./GoodsReceiptDrawer.data.hook", () => ({
  useGoodsReceiptDrawerData: () => dataState.current,
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

const config = {
  api: {},
  keys: createGoodsReceiptKeys(["v2-test-canedit"]),
  tableId: "t",
  permissionCollection: "c",
  requiredFields: ["receiptDate"],
  viewVisibility: {},
} as unknown as GoodsReceiptModuleConfig;

/** Form mặc định của phiếu mới có status DRAFT, nên test phải chứng minh nó không được dùng khi chưa tải xong */
const setRecord = (status: string, loaded: boolean) => {
  const form = { receiptNo: "GR-1", status, lines: [] };
  dataState.current = {
    ...dataState.current,
    form,
    initial: form,
    creating: false,
    loaded,
  };
};

/** Hook dưới test đặt tên `use…` để renderHook gọi đúng quy tắc hook */
const useDrawerUnderTest = () =>
  useGoodsReceiptDrawer({
    config,
    state: {
      open: true,
      recordId: "gr-1",
      mode: "view",
      canUpdate: true,
      canDelete: true,
      onClose: vi.fn(),
    } as never,
  });

const useDrawer = () => renderHook(useDrawerUnderTest, { wrapper });

describe("useGoodsReceiptDrawer canEdit (chỉ bật khi đã tải và là nháp)", () => {
  beforeEach(() => {
    dataState.current = { ...dataState.current, creating: false };
  });

  it("chưa tải xong thì không bật Chỉnh sửa dù form mặc định là DRAFT", () => {
    setRecord(GoodsReceiptStatus.DRAFT, false);
    const { result } = useDrawer();
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canPost).toBe(false);
  });

  it("phiếu đã ghi sổ không bao giờ bật Chỉnh sửa", () => {
    setRecord(GoodsReceiptStatus.POSTED, true);
    const { result } = useDrawer();
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canCancel).toBe(true);
  });

  it("phiếu nháp đã tải thì bật Chỉnh sửa", () => {
    setRecord(GoodsReceiptStatus.DRAFT, true);
    const { result } = useDrawer();
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canCancel).toBe(false);
  });
});
