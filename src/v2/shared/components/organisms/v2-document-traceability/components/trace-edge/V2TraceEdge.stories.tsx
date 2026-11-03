import type { Meta, StoryObj } from "@storybook/react";
import { V2TraceEdge } from "./V2TraceEdge";
import "../../traceability.locale";

const meta: Meta<typeof V2TraceEdge> = {
  title: "Components/Organisms/V2TraceEdge",
  component: V2TraceEdge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2TraceEdge>;

const base = {
  id: "e1",
  sourceX: 0,
  sourceY: 60,
  targetX: 260,
  targetY: 60,
  sourcePosition: "right",
  targetPosition: "left",
  style: {},
};

export const AmountReceipt: Story = {
  args: { ...base, label: "Thu trực tiếp: 2.160.000 đ" } as never,
};
export const AmountPayment: Story = {
  args: { ...base, label: "Chi phí: 500.000 đ", animated: true } as never,
};
export const NoteLabel: Story = {
  args: { ...base, label: "Doanh thu dịch vụ (HĐ bán)" } as never,
};
