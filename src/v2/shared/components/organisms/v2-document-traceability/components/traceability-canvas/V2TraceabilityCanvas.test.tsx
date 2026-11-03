import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2TraceabilityCanvas } from "./V2TraceabilityCanvas";
import "../../traceability.locale";
import type {
  TraceabilityGraphData,
  TraceabilityNode,
} from "../../types/traceability.type";

const doc = (
  id: string,
  docType: TraceabilityNode["docType"],
  docNo: string,
): TraceabilityNode => ({
  id,
  docType,
  docNo,
  title: `Tiêu đề ${docNo}`,
  isCurrent: id === "root",
  depth: id === "root" ? 0 : 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
});

const graph: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [doc("root", "INVOICE", "HD-2148"), doc("bank", "BANK_TXN", "UNC-77")],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "bank",
      relationType: "NET_OFF",
      isTransitive: false,
      label: "Thanh toán: 500",
    },
  ],
  summary: {
    totalAmount: 0,
    totalNetOffAmount: 0,
    matchRatio: 0,
    directCount: 1,
    transitiveCount: 0,
  },
};

beforeAll(() => {
  // React Flow đo kích thước bằng ResizeObserver; jsdom không có nên cần stub
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("V2TraceabilityCanvas", () => {
  it("renders the document nodes and their stage labels", () => {
    render(<V2TraceabilityCanvas graph={graph} direction="horizontal" />);
    expect(screen.getByText("HD-2148")).toBeInTheDocument();
    expect(screen.getByText("UNC-77")).toBeInTheDocument();
    expect(screen.getByText("HÓA ĐƠN VAT")).toBeInTheDocument();
  });

  it("shows the layout toggle only when a handler is given", () => {
    const { unmount } = render(
      <V2TraceabilityCanvas graph={graph} direction="horizontal" />,
    );
    expect(screen.queryByLabelText("Đổi sang bố cục Dọc")).toBeNull();
    unmount();

    render(
      <V2TraceabilityCanvas
        graph={graph}
        direction="horizontal"
        onToggleDirection={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Đổi sang bố cục Dọc")).toBeInTheDocument();
  });
});
