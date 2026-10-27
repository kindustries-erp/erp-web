import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { V2TraceNode } from "./V2TraceNode";
import "../../traceability.locale";
import type { TraceabilityNode } from "../../types/traceability.type";

const base: TraceabilityNode = {
  id: "bank-1",
  docType: "BANK_TXN",
  docNo: "UNC-77",
  title: "Chuyển khoản mua hàng",
  date: "2026-10-26",
  amount: 1413720,
  isCurrent: false,
  depth: 1,
  hasPermission: true,
  restricted: false,
  requiredResource: "",
};

const meta: Meta<typeof V2TraceNode> = {
  title: "Components/Organisms/V2TraceNode",
  component: V2TraceNode,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div className="w-[320px] p-4">
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceNode>;

const asProps = (node: TraceabilityNode, extra = {}) =>
  ({
    id: node.id,
    type: "traceabilityNode",
    selected: false,
    data: { node, allowEdit: false, actions: {}, ...extra },
  }) as never;

export const Payment: Story = { args: asProps(base) as never };
export const InboundInvoice: Story = {
  args: asProps({
    ...base,
    id: "inv-1",
    docType: "INVOICE",
    docNo: "2148",
    title: "HĐ mua",
    partnerName: "CTY HAPS",
    metadata: { taxInvoiceStatus: 3 },
  }) as never,
};
export const Restricted: Story = {
  args: asProps({
    ...base,
    restricted: true,
    requiredResource: "bank",
  }) as never,
};
