import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { V2TraceNodeHeader } from "./V2TraceNodeHeader";
import { getTraceabilityVisualMeta } from "../../utils/traceability.visual";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../traceability.locale";

const meta: Meta<typeof V2TraceNodeHeader> = {
  title: "Components/Organisms/V2TraceNodeHeader",
  component: V2TraceNodeHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[290px] rounded-xl border bg-white dark:bg-slate-900">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceNodeHeader>;

const base = {
  meta: getTraceabilityVisualMeta({
    docType: "BANK_TXN",
    docNo: "UNC-77",
    title: "Chuyển khoản",
  }),
  docNo: "UNC-77",
  copied: false,
  isCurrent: false,
  restricted: false,
  requiredResource: "",
  canUnlink: true,
  canOpen: true,
  isManual: false,
  onCopy: () => undefined,
  onUnlink: () => undefined,
  onOpen: () => undefined,
};

// Story dùng hàm t thật của V2 để hiển thị đúng nhãn
const withT = (args: Partial<typeof base>) => {
  const Wrapped = () => {
    const { t } = useV2Translation();
    return <V2TraceNodeHeader {...base} {...args} t={t} />;
  };
  return <Wrapped />;
};

export const Editable: Story = { render: () => withT({}) };
export const Current: Story = {
  render: () => withT({ isCurrent: true, canUnlink: false, canOpen: false }),
};
export const Restricted: Story = {
  render: () =>
    withT({ restricted: true, canOpen: false, requiredResource: "bank" }),
};
