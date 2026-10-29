import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTraceabilityLogic } from "./useTraceabilityLogic";

const graph = { rootId: "r1", nodes: [], edges: [] } as any;

describe("useTraceabilityLogic", () => {
  it("chỉ gọi fetchGraph 1 lần khi mount", async () => {
    const fetchGraph = vi.fn().mockResolvedValue(graph);
    const { result } = renderHook(() =>
      useTraceabilityLogic({ rootId: "r1", fetchGraph } as any),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchGraph).toHaveBeenCalledTimes(1);
  });

  it("refetch khi thoát edit mode", async () => {
    const fetchGraph = vi.fn().mockResolvedValue(graph);
    const { result, rerender } = renderHook(
      ({ editMode }) =>
        useTraceabilityLogic({ rootId: "r1", fetchGraph, editMode } as any),
      { initialProps: { editMode: true } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ editMode: false });
    await waitFor(() => expect(fetchGraph).toHaveBeenCalledTimes(2));
  });
});
