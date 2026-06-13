import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  useInventoryMasterDeleteMutation,
  useInventoryMasterSaveMutation,
} from "@/modules/inventory-core/hooks/useInventoryMasterMutation";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

vi.mock("@/modules/inventory-core/api/inventoryCoreApi", () => ({
  inventoryCoreApi: {
    createUom: vi.fn(),
    updateUom: vi.fn(),
    createItemType: vi.fn(),
    updateItemType: vi.fn(),
    deleteUom: vi.fn(),
    deleteItemType: vi.fn(),
  },
}));

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useInventoryMasterMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes save mutation to createUom and invalidates uoms query", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    vi.mocked(inventoryCoreApi.createUom).mockResolvedValue({
      id: "u1",
      code: "PCS",
      name: "Pieces",
      isActive: true,
    } as any);

    const { result } = renderHook(() => useInventoryMasterSaveMutation(), {
      wrapper: createWrapper(client),
    });

    await expect(
      result.current.mutateAsync({
        kind: "uom",
        payload: { code: "PCS", name: "Pieces", isActive: true },
      }),
    ).resolves.toMatchObject({ id: "u1", code: "PCS" });

    expect(inventoryCoreApi.createUom).toHaveBeenCalledWith({
      code: "PCS",
      name: "Pieces",
      isActive: true,
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inventory-masters", "uoms"],
      });
    });
  });

  it("routes save mutation to updateItemType and invalidates item-types query", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    vi.mocked(inventoryCoreApi.updateItemType).mockResolvedValue({
      id: "it1",
      code: "FG",
      name: "Finished Goods",
      isActive: true,
    } as any);

    const { result } = renderHook(() => useInventoryMasterSaveMutation(), {
      wrapper: createWrapper(client),
    });

    await expect(
      result.current.mutateAsync({
        kind: "item-type",
        id: "it1",
        payload: { code: "FG", name: "Finished Goods", isActive: true },
      }),
    ).resolves.toMatchObject({ id: "it1", code: "FG" });

    expect(inventoryCoreApi.updateItemType).toHaveBeenCalledWith("it1", {
      code: "FG",
      name: "Finished Goods",
      isActive: true,
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inventory-masters", "item-types"],
      });
    });
  });

  it("routes delete mutation to deleteUom and invalidates uoms query", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    vi.mocked(inventoryCoreApi.deleteUom).mockResolvedValue(undefined);

    const { result } = renderHook(() => useInventoryMasterDeleteMutation(), {
      wrapper: createWrapper(client),
    });

    await expect(
      result.current.mutateAsync({ kind: "uom", id: "u1" }),
    ).resolves.toBeUndefined();

    expect(inventoryCoreApi.deleteUom).toHaveBeenCalledWith("u1");
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["inventory-masters", "uoms"],
      });
    });
  });
});
