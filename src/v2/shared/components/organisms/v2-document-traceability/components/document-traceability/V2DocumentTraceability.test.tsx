import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2DocumentTraceability } from "./V2DocumentTraceability";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../../types/traceability.type";
import "../../traceability.locale";

const node = (id: string, depth: number, docNo: string): TraceabilityNode => ({
  id,
  docType: "BANK_TXN",
  docNo,
  title: `Tiêu đề ${docNo}`,
  date: "2026-10-26",
  amount: 500,
  isCurrent: depth === 0,
  depth,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

const graph: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [node("root", 0, "HD-1"), node("a", 1, "UNC-A")],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "a",
      relationType: "NET_OFF",
      isTransitive: false,
    },
  ],
  summary: {
    totalAmount: 500,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 1,
    transitiveCount: 0,
  },
};

const renderEntry = (
  props: Partial<React.ComponentProps<typeof V2DocumentTraceability>> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <V2DocumentTraceability rootId="root" graphData={graph} {...props} />
    </QueryClientProvider>,
  );
};

describe("V2DocumentTraceability", () => {
  it("reports the linked count to the parent", () => {
    const onLinkedCountChange = vi.fn();
    renderEntry({ onLinkedCountChange });
    expect(onLinkedCountChange).toHaveBeenCalledWith(1);
  });

  it("switches to the pipeline view", () => {
    renderEntry();
    fireEvent.click(screen.getByText("Quy trình"));
    expect(screen.getByText("UNC-A")).toBeInTheDocument();
  });

  it("unlinks a document only after the user confirms", async () => {
    const onUnlinkNode = vi.fn().mockResolvedValue(undefined);
    renderEntry({ editMode: true, onUnlinkNode });
    fireEvent.click(screen.getByText("Quy trình"));

    fireEvent.click(screen.getByTitle("Gỡ liên kết chứng từ này"));
    expect(onUnlinkNode).not.toHaveBeenCalled();
    expect(
      screen.getByText("Gỡ liên kết chứng từ UNC-A khỏi chứng từ này?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Gỡ liên kết" }));
    await waitFor(() =>
      expect(onUnlinkNode).toHaveBeenCalledWith(
        expect.objectContaining({ id: "a" }),
      ),
    );
  });

  it("does not offer unlinking outside edit mode", () => {
    renderEntry({ editMode: false, onUnlinkNode: vi.fn() });
    fireEvent.click(screen.getByText("Quy trình"));
    expect(screen.queryByTitle("Gỡ liên kết chứng từ này")).toBeNull();
  });

  it("opens the canvas in a full-size dialog and returns inline on exit", () => {
    renderEntry();
    fireEvent.click(screen.getByLabelText("Toàn màn hình"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Thoát toàn màn hình"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByLabelText("Toàn màn hình")).toBeInTheDocument();
  });
});
