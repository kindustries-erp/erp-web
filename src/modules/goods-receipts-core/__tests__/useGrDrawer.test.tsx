import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useGrDrawer,
  emptyGrForm,
  buildGrForm,
  buildGrPayload,
} from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";

vi.mock("@/modules/goods-receipts-core/api/goodsReceiptsCoreApi", () => ({
  goodsReceiptsCoreApi: {
    create: vi.fn(),
    update: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    cancel: vi.fn(),
    nextNo: vi.fn(),
  },
}));

vi.mock("@/modules/purchase-orders-core/api/purchaseOrdersCoreApi", () => ({
  purchaseOrdersCoreApi: {
    list: vi.fn().mockResolvedValue({ items: [] }),
    get: vi.fn().mockResolvedValue({ id: "po-1", lines: [] }),
  },
}));

vi.mock("@/modules/inventory-core/api/inventoryCoreApi", () => ({
  inventoryCoreApi: {
    list: vi.fn().mockResolvedValue({ items: [] }),
  },
}));

vi.mock("@/core/config/uiStore", () => ({
  useUIStore: (selector: any) =>
    selector({
      showToast: vi.fn(),
      setGlobalLoading: vi.fn(),
    }),
}));

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

const mockGrDetail = {
  id: "gr-1",
  receiptNo: "NK-20260720-01",
  purchaseOrderId: "po-1",
  productionOrderId: null,
  receiptDate: "2026-07-20T00:00:00.000Z",
  status: "DRAFT",
  remarks: "memo",
  lines: [
    {
      id: "grl-1",
      purchaseOrderLineId: "pol-1",
      itemId: "item-1",
      itemName: "Item 1",
      qtyReceived: "3.000",
      unitCost: "100.000",
    },
  ],
};

describe("buildGrPayload", () => {
  it("maps PO receipt and filters out non-positive qty lines", () => {
    const form = {
      ...emptyGrForm(),
      receiptType: "PO" as const,
      purchaseOrderId: "po-1",
      receiptNo: " NK-01 ",
      lines: [
        {
          purchaseOrderLineId: "pol-1",
          productionOrderMaterialId: "",
          itemId: "item-1",
          itemName: "Item 1",
          qtyReceived: "0",
          unitCost: "10",
        },
        {
          purchaseOrderLineId: "pol-2",
          productionOrderMaterialId: "",
          itemId: "item-2",
          itemName: "Item 2",
          qtyReceived: "5",
          unitCost: "12",
        },
      ],
    };

    const payload = buildGrPayload(form);
    expect(payload.purchaseOrderId).toBe("po-1");
    expect(payload.receiptNo).toBe("NK-01");
    expect(payload.lines).toHaveLength(1);
    expect(payload.lines?.[0].itemId).toBe("item-2");
  });

  it("clears purchaseOrderId when receiptType is OTHER", () => {
    const form = {
      ...emptyGrForm(),
      receiptType: "OTHER" as const,
      purchaseOrderId: "po-1",
      lines: [],
    };

    const payload = buildGrPayload(form);
    expect(payload.purchaseOrderId).toBeUndefined();
  });
});

describe("buildGrForm", () => {
  it("builds form from detail response", () => {
    const form = buildGrForm(mockGrDetail as any);
    expect(form.receiptNo).toBe("NK-20260720-01");
    expect(form.receiptType).toBe("PO");
    expect(form.purchaseOrderId).toBe("po-1");
    expect(form.lines).toHaveLength(1);
    expect(form.lines[0].qtyReceived).toBe("3.000");
  });
});

describe("useGrDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("openDetail loads detail and populates editing + form", async () => {
    const client = makeClient();
    vi.mocked(goodsReceiptsCoreApi.get).mockResolvedValue(mockGrDetail as any);

    const { result } = renderHook(() => useGrDrawer(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.openDetail("gr-1", true);
    });

    await waitFor(() => {
      expect(goodsReceiptsCoreApi.get).toHaveBeenCalledWith("gr-1");
      expect(result.current.editing?.id).toBe("gr-1");
      expect(result.current.form.receiptNo).toBe("NK-20260720-01");
      expect(result.current.viewOnly).toBe(true);
    });
  });

  it("handleSave(create + POST) gets nextNo, creates then posts and invalidates", async () => {
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const onSaved = vi.fn().mockResolvedValue(undefined);

    vi.mocked(goodsReceiptsCoreApi.nextNo).mockResolvedValue("NK-20260720-99");
    vi.mocked(goodsReceiptsCoreApi.create).mockResolvedValue({
      ...mockGrDetail,
      id: "gr-99",
    } as any);
    vi.mocked(goodsReceiptsCoreApi.post).mockResolvedValue({
      ...mockGrDetail,
      id: "gr-99",
      status: "POSTED",
    } as any);

    const { result } = renderHook(
      () => useGrDrawer({ invalidateWarehouseQuery: true, onSaved }),
      {
        wrapper: createWrapper(client),
      },
    );

    act(() => {
      result.current.openCreate();
      result.current.setForm((f) => ({
        ...f,
        receiptDate: "2026-07-20",
        receiptNo: "",
        lines: [
          {
            purchaseOrderLineId: "",
            productionOrderMaterialId: "",
            itemId: "item-1",
            itemName: "Item 1",
            qtyReceived: "2",
            unitCost: "100",
          },
        ],
      }));
    });

    await act(async () => {
      await result.current.handleSave("POSTED");
    });

    await waitFor(() => {
      expect(goodsReceiptsCoreApi.nextNo).toHaveBeenCalledWith("2026-07-20");
      expect(goodsReceiptsCoreApi.create).toHaveBeenCalledTimes(1);
      expect(goodsReceiptsCoreApi.post).toHaveBeenCalledWith("gr-99");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["warehouse-vouchers", "unified"],
      });
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(result.current.open).toBe(false);
    });
  });

  it("handleCancel calls API and onSaved", async () => {
    const client = makeClient();
    const onSaved = vi.fn().mockResolvedValue(undefined);
    vi.mocked(goodsReceiptsCoreApi.cancel).mockResolvedValue({
      ...mockGrDetail,
      status: "CANCELLED",
    } as any);

    const { result } = renderHook(() => useGrDrawer({ onSaved }), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.handleCancel("gr-1");
    });

    await waitFor(() => {
      expect(goodsReceiptsCoreApi.cancel).toHaveBeenCalledWith("gr-1");
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(result.current.cancelId).toBeNull();
    });
  });
});
