import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useV2Traceability } from "./useV2Traceability";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../types/traceability.type";

const node = (id: string, amount = 0): TraceabilityNode => ({
  id,
  docType: "BANK_TXN",
  docNo: id,
  title: id,
  amount,
  isCurrent: id === "root",
  depth: 0,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

const graph = (): TraceabilityGraphData => ({
  rootId: "root",
  rootType: "INVOICE",
  nodes: [node("root"), node("a", 100), node("b", 50)],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "a",
      relationType: "NET_OFF",
      isTransitive: false,
    },
    {
      id: "e2",
      source: "root",
      target: "b",
      relationType: "NET_OFF",
      isTransitive: false,
    },
  ],
  summary: {
    totalAmount: 150,
    totalNetOffAmount: 150,
    matchRatio: 1,
    directCount: 2,
    transitiveCount: 0,
  },
});

const setup = (
  props: Partial<Parameters<typeof useV2Traceability>[0]> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const fetchGraph = vi.fn().mockResolvedValue(graph());
  const hook = renderHook((p) => useV2Traceability(p), {
    wrapper,
    initialProps: { rootId: "root", fetchGraph, editMode: false, ...props },
  });
  return { ...hook, fetchGraph };
};

describe("useV2Traceability", () => {
  it("fetches the graph once on mount", async () => {
    const { result, fetchGraph } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchGraph).toHaveBeenCalledTimes(1);
    expect(result.current.graph?.nodes).toHaveLength(3);
  });

  it("refetches once when leaving edit mode", async () => {
    const { result, rerender, fetchGraph } = setup({ editMode: true });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchGraph).toHaveBeenCalledTimes(1);

    rerender({ rootId: "root", fetchGraph, editMode: false });
    await waitFor(() => expect(fetchGraph).toHaveBeenCalledTimes(2));
  });

  it("does not refetch when edit mode stays off", async () => {
    const { result, rerender, fetchGraph } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ rootId: "root", fetchGraph, editMode: false });
    expect(fetchGraph).toHaveBeenCalledTimes(1);
  });

  it("uses controlled graph data and never fetches", () => {
    const controlled = graph();
    const { result, fetchGraph } = setup({ graphData: controlled });
    expect(result.current.graph).toBe(controlled);
    expect(fetchGraph).not.toHaveBeenCalled();
  });

  it("removes a node optimistically in edit mode without refetching", async () => {
    const onUnlinkNode = vi.fn().mockResolvedValue(undefined);
    const { result, fetchGraph } = setup({ editMode: true, onUnlinkNode });
    await waitFor(() => expect(result.current.graph).not.toBeNull());

    act(() => result.current.requestUnlink(node("a", 100)));
    await act(() => result.current.confirmUnlink());

    expect(onUnlinkNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a" }),
    );
    expect(result.current.graph?.nodes.map((n) => n.id)).toEqual(["root", "b"]);
    expect(result.current.graph?.summary.totalNetOffAmount).toBe(50);
    expect(fetchGraph).toHaveBeenCalledTimes(1);
  });

  it("toggles direction and fullscreen", () => {
    const { result } = setup({ graphData: graph() });
    act(() => result.current.toggleDirection());
    expect(result.current.direction).toBe("vertical");
    act(() => result.current.toggleFullscreen());
    expect(result.current.isFullscreen).toBe(true);
  });
});
