import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactFlowProvider, type NodeProps } from "@xyflow/react";
import { V2TraceNode } from "./V2TraceNode";
import "../../traceability.locale";
import type {
  TraceDocFlowNode,
  TraceNodeData,
} from "../../types/traceability.flow.type";
import type { TraceabilityNode } from "../../types/traceability.type";

const node = (over: Partial<TraceabilityNode> = {}): TraceabilityNode => ({
  id: "doc-1",
  docType: "BANK_TXN",
  docNo: "UNC-001",
  title: "Chuyển khoản",
  amount: 1000,
  isCurrent: false,
  depth: 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
  ...over,
});

const renderNode = (
  data: Partial<TraceNodeData> & { node: TraceabilityNode },
  selected = false,
) => {
  const props = {
    id: data.node.id,
    type: "traceabilityNode",
    selected,
    data: { allowEdit: false, actions: {}, ...data },
  } as unknown as NodeProps<TraceDocFlowNode>;
  return render(
    <ReactFlowProvider>
      <V2TraceNode {...props} />
    </ReactFlowProvider>,
  );
};

describe("V2TraceNode", () => {
  it("shows the document number and its type label", () => {
    renderNode({ node: node() });
    expect(screen.getByText("UNC-001")).toBeInTheDocument();
    expect(screen.getByText("UNC")).toBeInTheDocument();
  });

  it("opens the document on double click", () => {
    const onOpenDocument = vi.fn();
    renderNode({ node: node(), actions: { onOpenDocument } });
    fireEvent.doubleClick(screen.getByText("UNC-001"));
    expect(onOpenDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc-1" }),
    );
  });

  it("does not open a journal entry", () => {
    const onOpenDocument = vi.fn();
    renderNode({
      node: node({ docType: "JOURNAL_ENTRY", docNo: "GL-1" }),
      actions: { onOpenDocument },
    });
    fireEvent.doubleClick(screen.getByText("GL-1"));
    expect(onOpenDocument).not.toHaveBeenCalled();
  });

  it("opens a manual settlement for editing only when editing is allowed", () => {
    const onEditManualSettlement = vi.fn();
    const manual = node({ id: "manual-9", title: "Chi khác" });
    const { unmount } = renderNode({
      node: manual,
      actions: { onEditManualSettlement },
    });
    fireEvent.doubleClick(screen.getByText("UNC-001"));
    expect(onEditManualSettlement).not.toHaveBeenCalled();
    unmount();

    renderNode({
      node: manual,
      allowEdit: true,
      actions: { onEditManualSettlement },
    });
    fireEvent.doubleClick(screen.getByText("UNC-001"));
    expect(onEditManualSettlement).toHaveBeenCalledTimes(1);
  });

  it("shows the unlink action only for a direct link while editing", () => {
    const onUnlinkNode = vi.fn();
    renderNode({ node: node(), allowEdit: true, actions: { onUnlinkNode } });
    fireEvent.click(screen.getByTitle("Gỡ liên kết chứng từ này"));
    expect(onUnlinkNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: "doc-1" }),
    );
  });

  it("hides the unlink action for a second-level document", () => {
    renderNode({
      node: node({ depth: 2 }),
      allowEdit: true,
      actions: { onUnlinkNode: vi.fn() },
    });
    expect(screen.queryByTitle("Gỡ liên kết chứng từ này")).toBeNull();
  });

  it("hides amount and shows a lock for a restricted document", () => {
    renderNode({ node: node({ restricted: true, requiredResource: "bank" }) });
    expect(screen.getByText("***")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ bảo mật")).toBeInTheDocument();
  });
});
