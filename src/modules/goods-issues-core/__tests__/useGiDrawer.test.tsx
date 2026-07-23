import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useGiDrawer,
  emptyGiForm,
  buildGiForm,
  buildGiPayload,
} from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { salesOrdersCoreApi } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";

vi.mock("@/modules/goods-issues-core/api/goodsIssuesCoreApi", () => ({
  goodsIssuesCoreApi: {
    create: vi.fn(),
    update: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/modules/manufacturing/api/manufacturingApi", () => ({
  manufacturingApi: {
    listVehicles: vi.fn().mockResolvedValue({ items: [] }),
  },
}));

vi.mock("@/modules/production-core/api/productionCoreApi", () => ({
  productionCoreApi: {
    listMasterOptions: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/modules/sales-orders-core/api/salesOrdersCoreApi", () => ({
  salesOrdersCoreApi: {
    list: vi.fn().mockResolvedValue({ items: [] }),
    get: vi.fn(),
  },
}));

vi.mock("@/modules/basic-masters/hooks/useBasicMasterInfinite", () => ({
  useBasicMasterInfinite: () => ({
    data: {
      pages: [
        {
          items: {
            inventoryItems: [{ id: "item-1", sku: "SKU-1", itemName: "A" }],
          },
        },
      ],
    },
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}));

vi.mock("@/core/config/uiStore", () => ({
  useUIStore: (selector: any) =>
    selector({
      showToast: vi.fn(),
      setGlobalLoading: vi.fn(),
    }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (x: string) => x,
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

const mockGiDetail = {
  id: "gi-1",
  issueNo: "XK-20260720-01",
  issueDate: "2026-07-20T00:00:00.000Z",
  issueType: "SALE",
  salesOrderId: "so-1",
  productionOrderId: null,
  status: "DRAFT",
  remarks: "memo",
  lines: [
    {
      id: "gil-1",
      salesOrderLineId: "sol-1",
      itemId: "item-1",
      itemName: "Item 1",
      qtyIssued: "2.000",
      unitCost: "100.000",
      serialId: "ser-1",
      vehicleId: "veh-1",
    },
  ],
};

describe("buildGiPayload", () => {
  it("maps SALE payload and filters non-positive qty lines", () => {
    const form = {
      ...emptyGiForm(),
      issueNo: " XK-01 ",
      issueType: "SALE",
      salesOrderId: "so-1",
      lines: [
        {
          salesOrderLineId: "sol-1",
          productionOrderMaterialId: "",
          itemId: "item-1",
          itemName: "Item 1",
          serialId: "",
          vehicleId: "",
          qtyIssued: "0",
          unitCost: "100",
        },
        {
          salesOrderLineId: "sol-2",
          productionOrderMaterialId: "",
          itemId: "item-2",
          itemName: "Item 2",
          serialId: "",
          vehicleId: "",
          qtyIssued: "3",
          unitCost: "120",
        },
      ],
    };

    const payload = buildGiPayload(form);
    expect(payload.issueNo).toBe("XK-01");
    expect(payload.salesOrderId).toBe("so-1");
    expect(payload.productionOrderId).toBeUndefined();
    expect(payload.lines).toHaveLength(1);
    expect(payload.lines?.[0].itemId).toBe("item-2");
  });

  it("maps PRODUCTION payload with productionOrderId", () => {
    const form = {
      ...emptyGiForm(),
      issueType: "PRODUCTION",
      productionOrderId: "mo-1",
      lines: [
        {
          salesOrderLineId: "",
          productionOrderMaterialId: "momat-1",
          itemId: "item-rm-1",
          itemName: "RM",
          serialId: "",
          vehicleId: "",
          qtyIssued: "2",
          unitCost: "50",
        },
      ],
    };

    const payload = buildGiPayload(form);
    expect(payload.salesOrderId).toBeUndefined();
    expect(payload.productionOrderId).toBe("mo-1");
    expect(payload.lines?.[0].productionOrderMaterialId).toBe("momat-1");
  });
});

describe("buildGiForm", () => {
  it("builds form from detail response", () => {
    const form = buildGiForm(mockGiDetail as any);
    expect(form.issueNo).toBe("XK-20260720-01");
    expect(form.issueType).toBe("SALE");
    expect(form.salesOrderId).toBe("so-1");
    expect(form.lines).toHaveLength(1);
    expect(form.lines[0].qtyIssued).toBe("2.000");
  });
});

describe("useGiDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("openCreate with productionOrder preset sets PRODUCTION mode", () => {
    const client = makeClient();
    const { result } = renderHook(() => useGiDrawer(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      result.current.openCreate("mo-1");
    });

    expect(result.current.open).toBe(true);
    expect(result.current.form.issueType).toBe("PRODUCTION");
    expect(result.current.form.productionOrderId).toBe("mo-1");
  });

  it("handleSoChange maps sales order lines including selected serials", async () => {
    const client = makeClient();

    vi.mocked(salesOrdersCoreApi.get).mockResolvedValue({
      id: "so-1",
      lines: [
        {
          id: "sol-serial",
          itemId: "item-1",
          itemName: "Item 1",
          qtyOrdered: "2",
          qtyDelivered: "0",
          unitPrice: "99",
          selectedSerialIds: ["ser-1", "ser-2"],
        },
        {
          id: "sol-bulk",
          itemId: "item-2",
          itemName: "Item 2",
          qtyOrdered: "10",
          qtyDelivered: "3",
          unitPrice: "50",
        },
      ],
    } as any);

    const { result } = renderHook(() => useGiDrawer(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.handleSoChange("so-1");
    });

    await waitFor(() => {
      expect(salesOrdersCoreApi.get).toHaveBeenCalledWith("so-1");
      expect(result.current.form.salesOrderId).toBe("so-1");
      expect(result.current.form.lines).toHaveLength(3);
      expect(result.current.form.lines[0].serialId).toBe("ser-1");
      expect(result.current.form.lines[1].serialId).toBe("ser-2");
      expect(result.current.form.lines[2].qtyIssued).toBe("7");
    });
  });

  it("handleSave(create + POST) dispatches refresh event and invalidates query", async () => {
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const refreshListener = vi.fn();
    window.addEventListener(
      "refresh_erp_data",
      refreshListener as EventListener,
    );

    vi.mocked(goodsIssuesCoreApi.create).mockResolvedValue({
      ...mockGiDetail,
      id: "gi-99",
    } as any);
    vi.mocked(goodsIssuesCoreApi.post).mockResolvedValue({
      ...mockGiDetail,
      id: "gi-99",
      status: "POSTED",
    } as any);

    const { result } = renderHook(
      () => useGiDrawer({ invalidateWarehouseQuery: true }),
      {
        wrapper: createWrapper(client),
      },
    );

    act(() => {
      result.current.openCreate();
      result.current.setForm((f) => ({
        ...f,
        issueNo: "XK-20260720-99",
        lines: [
          {
            salesOrderLineId: "",
            productionOrderMaterialId: "",
            itemId: "item-1",
            itemName: "Item 1",
            serialId: "",
            vehicleId: "",
            qtyIssued: "2",
            unitCost: "100",
          },
        ],
      }));
    });

    await act(async () => {
      await result.current.handleSave("POSTED");
    });

    await waitFor(() => {
      expect(goodsIssuesCoreApi.create).toHaveBeenCalledTimes(1);
      expect(goodsIssuesCoreApi.post).toHaveBeenCalledWith("gi-99");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["warehouse-vouchers", "unified"],
      });
      expect(refreshListener).toHaveBeenCalledTimes(1);
      expect(result.current.open).toBe(false);
    });

    window.removeEventListener(
      "refresh_erp_data",
      refreshListener as EventListener,
    );
  });

  it("openDetail loads editing data", async () => {
    const client = makeClient();
    vi.mocked(goodsIssuesCoreApi.get).mockResolvedValue(mockGiDetail as any);
    vi.mocked(salesOrdersCoreApi.get).mockResolvedValue({
      id: "so-1",
      soNo: "SO-01",
      customerName: "Customer A",
      lines: [],
    } as any);

    const { result } = renderHook(() => useGiDrawer(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.openDetail("gi-1", true);
    });

    await waitFor(() => {
      expect(goodsIssuesCoreApi.get).toHaveBeenCalledWith("gi-1");
      expect(result.current.editing?.id).toBe("gi-1");
      expect(result.current.form.issueNo).toBe("XK-20260720-01");
      expect(result.current.viewOnly).toBe(true);
    });
  });
});
