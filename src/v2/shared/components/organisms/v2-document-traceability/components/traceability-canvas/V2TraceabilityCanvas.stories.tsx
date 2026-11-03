import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
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
  extra: Partial<TraceabilityNode> = {},
): TraceabilityNode => ({
  id,
  docType,
  docNo,
  title: `Chứng từ ${docNo}`,
  date: "2026-10-26",
  amount: 1413720,
  isCurrent: id === "root",
  depth: id === "root" ? 0 : 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
  ...extra,
});

const sample: TraceabilityGraphData = {
  rootId: "root",
  rootType: "INVOICE",
  nodes: [
    doc("root", "INVOICE", "2148", { partnerName: "CÔNG TY CỔ PHẦN HAPS" }),
    doc("bank", "BANK_TXN", "UNC-77", { netOffAmount: 500000 }),
    doc("po", "PURCHASE_ORDER", "PO-12"),
    doc("je", "JOURNAL_ENTRY", "GL-9"),
  ],
  edges: [
    {
      id: "e1",
      source: "root",
      target: "bank",
      relationType: "NET_OFF",
      isTransitive: false,
      label: "Thanh toán: 500.000 đ",
    },
    {
      id: "e2",
      source: "po",
      target: "root",
      relationType: "INVOICED_FROM",
      isTransitive: false,
    },
    {
      id: "e3",
      source: "root",
      target: "je",
      relationType: "JOURNAL_POSTED",
      isTransitive: true,
      label: "Bút toán (HĐ mua)",
    },
  ],
  summary: {
    totalAmount: 1413720,
    totalNetOffAmount: 500000,
    matchRatio: 0.35,
    directCount: 2,
    transitiveCount: 1,
  },
};

const meta: Meta<typeof V2TraceabilityCanvas> = {
  title: "Components/Organisms/V2TraceabilityCanvas",
  component: V2TraceabilityCanvas,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: 520 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceabilityCanvas>;

export const Horizontal: Story = {
  args: { graph: sample, direction: "horizontal", allowEdit: false },
};

export const VerticalEditing: Story = {
  args: {
    graph: sample,
    direction: "vertical",
    allowEdit: true,
    onAddLink: () => undefined,
    onUnlinkNode: () => undefined,
    onOpenDocument: () => undefined,
    onToggleDirection: () => undefined,
  },
};
