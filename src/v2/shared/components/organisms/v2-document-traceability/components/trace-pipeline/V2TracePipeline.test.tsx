import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2TracePipeline } from "./V2TracePipeline";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../../types/traceability.type";
import "../../traceability.locale";

const doc = (
  id: string,
  docType: TraceabilityNode["docType"],
  docNo: string,
  over: Partial<TraceabilityNode> = {},
): TraceabilityNode => ({
  id,
  docType,
  docNo,
  title: `Tiêu đề ${docNo}`,
  date: "2026-10-26",
  amount: 1000,
  isCurrent: id === "root",
  depth: id === "root" ? 0 : 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
  ...over,
});

const graph: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [doc("root", "INVOICE", "HD-1"), doc("bank", "BANK_TXN", "UNC-9")],
  edges: [],
  summary: {
    totalAmount: 0,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 1,
    transitiveCount: 0,
  },
};

describe("V2TracePipeline", () => {
  it("places each document under its stage and shows empty stages", () => {
    render(<V2TracePipeline graph={graph} allowEdit={false} />);
    expect(screen.getByText("HD-1")).toBeInTheDocument();
    expect(screen.getByText("UNC-9")).toBeInTheDocument();
    expect(screen.getAllByText("Không có chứng từ").length).toBeGreaterThan(0);
  });

  it("adds a link to a stage when editing", () => {
    const onAddLink = vi.fn();
    render(<V2TracePipeline graph={graph} allowEdit onAddLink={onAddLink} />);
    fireEvent.click(
      screen.getAllByTitle("Ghép nối chứng từ vào 2. Hóa đơn VAT")[0],
    );
    expect(onAddLink).toHaveBeenCalledWith("INVOICE", "INVOICE");
  });

  it("opens a document from its card's detail button", () => {
    const onOpenDocument = vi.fn();
    render(
      <V2TracePipeline
        graph={graph}
        allowEdit={false}
        onOpenDocument={onOpenDocument}
      />,
    );
    fireEvent.click(screen.getByTitle("Mở chi tiết chứng từ"));
    expect(onOpenDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "bank" }),
    );
  });
});
