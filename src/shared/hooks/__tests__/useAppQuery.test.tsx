import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useAppMutation, useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  createInventoryItemsListKey,
  createInventoryMastersKey,
} from "@/shared/lib/queryKeys";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("shared react-query helpers", () => {
  it("useAppQuery proxies useQuery and resolves data", async () => {
    const queryFn = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(
      () =>
        useAppQuery({
          queryKey: ["test-query"],
          queryFn,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("ok");
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("useAppMutation proxies useMutation and resolves mutateAsync", async () => {
    const mutationFn = vi.fn(async (value: number) => value * 2);
    const { result } = renderHook(
      () =>
        useAppMutation({
          mutationFn,
        }),
      { wrapper: createWrapper() },
    );

    await expect(result.current.mutateAsync(21)).resolves.toBe(42);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(mutationFn.mock.calls[0]?.[0]).toBe(21);
  });

  it("query key builders normalize empty filters for stable reuse", () => {
    expect(
      createInventoryItemsListKey({
        page: 1,
        pageSize: 50,
        search: "",
        status: undefined,
        itemType: "FG",
      }),
    ).toEqual([
      "inventory-items",
      "list",
      { itemType: "FG", page: 1, pageSize: 50 },
    ]);

    expect(
      createInventoryMastersKey("uoms", {
        page: 1,
        pageSize: 500,
        search: "",
        isActive: true,
      }),
    ).toEqual([
      "inventory-masters",
      "uoms",
      { isActive: true, page: 1, pageSize: 500 },
    ]);
  });
});
