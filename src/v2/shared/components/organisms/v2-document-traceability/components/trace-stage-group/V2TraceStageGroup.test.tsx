import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { NodeProps } from "@xyflow/react";
import { V2TraceStageGroup } from "./V2TraceStageGroup";
import "../../traceability.locale";
import { TRACEABILITY_STAGES } from "../../constants/traceability.constants";
import type {
  TraceStageFlowNode,
  TraceStageGroupData,
} from "../../types/traceability.flow.type";

const invoiceStage = TRACEABILITY_STAGES.find((s) => s.key === "INVOICE")!;
const orderStage = TRACEABILITY_STAGES.find((s) => s.key === "ORDER_STOCK")!;

const renderGroup = (
  data: Partial<TraceStageGroupData> & Pick<TraceStageGroupData, "stage">,
) => {
  const props = {
    id: `stage-group-${data.stage.key}`,
    data: { count: 1, allowEdit: true, actions: {}, ...data },
  } as unknown as NodeProps<TraceStageFlowNode>;
  return render(<V2TraceStageGroup {...props} />);
};

describe("V2TraceStageGroup", () => {
  it("shows the stage label and document count", () => {
    renderGroup({ stage: invoiceStage, count: 3 });
    expect(screen.getByText("HÓA ĐƠN VAT")).toBeInTheDocument();
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  it("passes the stage key and no type when the stage has several types", () => {
    const onAddLink = vi.fn();
    renderGroup({ stage: orderStage, actions: { onAddLink } });
    fireEvent.click(screen.getByText("Thêm liên kết"));
    expect(onAddLink).toHaveBeenCalledWith("ORDER_STOCK", undefined);
  });

  it("passes the single allowed type when the stage has one", () => {
    const onAddLink = vi.fn();
    renderGroup({ stage: invoiceStage, actions: { onAddLink } });
    fireEvent.click(screen.getByText("Thêm liên kết"));
    expect(onAddLink).toHaveBeenCalledWith("INVOICE", "INVOICE");
  });

  it("hides the add action when editing is off", () => {
    renderGroup({
      stage: invoiceStage,
      allowEdit: false,
      actions: { onAddLink: vi.fn() },
    });
    expect(screen.queryByText("Thêm liên kết")).toBeNull();
  });

  it("hides the add action when no allowed type belongs to the stage", () => {
    renderGroup({
      stage: invoiceStage,
      allowedDocTypes: ["BANK_TXN"],
      actions: { onAddLink: vi.fn() },
    });
    expect(screen.queryByText("Thêm liên kết")).toBeNull();
  });
});
