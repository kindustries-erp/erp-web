import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2TraceTable } from "./V2TraceTable";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../../types/traceability.type";
import "../../traceability.locale";

const renderTable = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

const node = (id: string, depth: number, docNo: string): TraceabilityNode => ({
  id,
  docType: "BANK_TXN",
  docNo,
  title: `Tiêu đề ${docNo}`,
  date: "2026-10-26",
  amount: 500,
  isCurrent: false,
  depth,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

const graph: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [
    { ...node("root", 0, "HD-1"), isCurrent: true },
    node("a", 1, "UNC-A"),
    node("b", 2, "UNC-B"),
  ],
  edges: [],
  summary: {
    totalAmount: 0,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 1,
    transitiveCount: 1,
  },
};

describe("V2TraceTable", () => {
  it("shows direct and indirect sections with their documents", () => {
    renderTable(<V2TraceTable graph={graph} allowEdit={false} />);
    expect(
      screen.getByText("Chứng từ liên kết trực tiếp (1-hop)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
    ).toBeInTheDocument();
    expect(screen.getByText("UNC-A")).toBeInTheDocument();
    expect(screen.getByText("UNC-B")).toBeInTheDocument();
  });

  it("does not list the root document as a linked row", () => {
    renderTable(<V2TraceTable graph={graph} allowEdit={false} />);
    expect(screen.queryByText("HD-1")).toBeNull();
  });
});
