import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  useIaDrawer,
  emptyIaForm,
  buildIaForm,
  buildIaPayload,
} from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { inventoryAdjustmentsApi } from "@/modules/inventory-adjustments/api/inventoryAdjustmentsApi";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/modules/inventory-adjustments/api/inventoryAdjustmentsApi", () => ({
  inventoryAdjustmentsApi: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    getNextNo: vi.fn(),
    postAdjustment: vi.fn(),
    cancelAdjustment: vi.fn(),
    delete: vi.fn(),
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

vi.mock("@/modules/basic-masters/hooks/useBasicMasterInfinite", () => ({
  useBasicMasterInfinite: () => ({
    data: undefined,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}));

// ─── Wrapper ──────────────────────────────────────────────────────────────────

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAdjData = {
  id: "adj1",
  adjustmentNo: "DC-20260720-01",
  adjustmentDate: "2026-07-20",
  status: "DRAFT",
  remarks: "Test",
  lines: [
    {
      id: "line1",
      itemId: "item1",
      qtyAdjusted: "5.000",
      unitCost: "10.000",
      typeAdjust: "increase",
    },
  ],
};

// ─── Pure function tests ───────────────────────────────────────────────────────

describe("buildIaPayload", () => {
  it("sets typeAdjust to 'increase' for positive qty", () => {
    const form = {
      ...emptyIaForm(),
      lines: [{ itemId: "item1", qtyAdjusted: "5", unitCost: "10" }],
    };
    const payload = buildIaPayload(form);
    expect(payload.lines![0].typeAdjust).toBe("increase");
    expect(payload.lines![0].qtyAdjusted).toBe(5);
  });

  it("sets typeAdjust to 'decrease' for negative qty", () => {
    const form = {
      ...emptyIaForm(),
      lines: [{ itemId: "item1", qtyAdjusted: "-3", unitCost: "10" }],
    };
    const payload = buildIaPayload(form);
    expect(payload.lines![0].typeAdjust).toBe("decrease");
    expect(payload.lines![0].qtyAdjusted).toBe(-3);
  });

  it("filters out lines with qtyAdjusted = 0", () => {
    const form = {
      ...emptyIaForm(),
      lines: [
        { itemId: "item1", qtyAdjusted: "0", unitCost: "10" },
        { itemId: "item2", qtyAdjusted: "3", unitCost: "10" },
      ],
    };
    const payload = buildIaPayload(form);
    expect(payload.lines).toHaveLength(1);
    expect(payload.lines![0].itemId).toBe("item2");
  });
});

describe("buildIaForm", () => {
  it("populates form correctly from API data", () => {
    const form = buildIaForm(mockAdjData as any);
    expect(form.adjustmentNo).toBe("DC-20260720-01");
    expect(form.adjustmentDate).toBe("2026-07-20");
    expect(form.remarks).toBe("Test");
    expect(form.lines).toHaveLength(1);
    expect(form.lines[0].itemId).toBe("item1");
    expect(form.lines[0].qtyAdjusted).toBe("5.000");
  });
});

// ─── Hook tests ───────────────────────────────────────────────────────────────

describe("useIaDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleSave (create mode): calls create API and then onSaved callback", async () => {
    const onSaved = vi.fn().mockResolvedValue(undefined);
    const client = makeClient();

    (
      inventoryAdjustmentsApi.getNextNo as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ nextNo: "DC-20260720-01" });
    (
      inventoryAdjustmentsApi.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      message: "Tạo phiếu điều chỉnh thành công",
      data: { ...mockAdjData },
    });

    const { result } = renderHook(() => useIaDrawer({ onSaved }), {
      wrapper: createWrapper(client),
    });

    act(() => {
      result.current.openCreate();
    });

    // Set a line with valid qty
    act(() => {
      result.current.setForm((f) => ({
        ...f,
        lines: [{ itemId: "item1", qtyAdjusted: "5", unitCost: "10" }],
      }));
    });

    await act(async () => {
      await result.current.handleSave();
    });

    await waitFor(() => {
      expect(inventoryAdjustmentsApi.create).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it("handleSave (create + POST): calls create then postAdjustment", async () => {
    const client = makeClient();

    (
      inventoryAdjustmentsApi.getNextNo as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ nextNo: "DC-20260720-01" });
    (
      inventoryAdjustmentsApi.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      message: "ok",
      data: mockAdjData,
    });
    (
      inventoryAdjustmentsApi.postAdjustment as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ message: "ok", data: {} });

    const { result } = renderHook(() => useIaDrawer(), {
      wrapper: createWrapper(client),
    });

    act(() => {
      result.current.openCreate();
    });

    act(() => {
      result.current.setForm((f) => ({
        ...f,
        lines: [{ itemId: "item1", qtyAdjusted: "5", unitCost: "10" }],
      }));
    });

    await act(async () => {
      await result.current.handleSave("POSTED");
    });

    await waitFor(() => {
      expect(inventoryAdjustmentsApi.create).toHaveBeenCalledTimes(1);
      expect(inventoryAdjustmentsApi.postAdjustment).toHaveBeenCalledWith(
        "adj1",
      );
    });
  });

  it("openDetail: loads editing data and populates form", async () => {
    const client = makeClient();

    (
      inventoryAdjustmentsApi.getById as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: mockAdjData,
    });

    const { result } = renderHook(() => useIaDrawer(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.openDetail("adj1", true);
    });

    await waitFor(() => {
      expect(result.current.editing?.id).toBe("adj1");
      expect(result.current.form.adjustmentNo).toBe("DC-20260720-01");
      expect(result.current.form.lines).toHaveLength(1);
      expect(result.current.viewOnly).toBe(true);
    });
  });

  it("handleCancel: calls cancelAdjustment API and then onSaved", async () => {
    const onSaved = vi.fn().mockResolvedValue(undefined);
    const client = makeClient();

    (
      inventoryAdjustmentsApi.cancelAdjustment as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useIaDrawer({ onSaved }), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.handleCancel("adj1");
    });

    await waitFor(() => {
      expect(inventoryAdjustmentsApi.cancelAdjustment).toHaveBeenCalledWith(
        "adj1",
      );
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });
});
