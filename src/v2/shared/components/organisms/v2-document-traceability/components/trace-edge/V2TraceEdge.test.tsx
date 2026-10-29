import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Position, type EdgeProps } from "@xyflow/react";
import { V2TraceEdge } from "./V2TraceEdge";
import "../../traceability.locale";

// Nhãn cạnh được vẽ qua portal của ReactFlow, cần đo kích thước nút (jsdom không có).
// Mock để kiểm nội dung nhãn trực tiếp.
vi.mock("@xyflow/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xyflow/react")>();
  return {
    ...actual,
    BaseEdge: () => null,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

const renderEdge = (label?: string) => {
  const props = {
    id: "e1",
    sourceX: 0,
    sourceY: 100,
    targetX: 200,
    targetY: 100,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    label,
    animated: false,
    style: {},
  } as unknown as EdgeProps;
  return render(<V2TraceEdge {...props} />);
};

describe("V2TraceEdge", () => {
  it("renders the title and value of an amount label", () => {
    renderEdge("Thu trực tiếp: 2.160.000 đ");
    expect(screen.getByText("Thu trực tiếp")).toBeInTheDocument();
    expect(screen.getByText("2.160.000 đ")).toBeInTheDocument();
  });

  it("renders a plain label as text", () => {
    renderEdge("Liên kết");
    expect(screen.getByText("Liên kết")).toBeInTheDocument();
  });

  it("renders no label when the edge has none", () => {
    renderEdge(undefined);
    expect(screen.queryByText("Liên kết")).toBeNull();
  });
});
