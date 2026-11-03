import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2TraceToolbar } from "./V2TraceToolbar";
import "../../traceability.locale";
import type { TraceabilityViewMode } from "../../types/traceability.type";

const meta: Meta<typeof V2TraceToolbar> = {
  title: "Components/Organisms/V2TraceToolbar",
  component: V2TraceToolbar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceToolbar>;

const Interactive = (
  args: Partial<React.ComponentProps<typeof V2TraceToolbar>>,
) => {
  const [viewMode, setViewMode] = useState<TraceabilityViewMode>("canvas");
  const [isFullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  return (
    <V2TraceToolbar
      linkedCount={2}
      canLink
      linkTypes={["BANK_TXN", "PURCHASE_ORDER"]}
      linkOpen={linkOpen}
      onLinkOpenChange={setLinkOpen}
      onSelectLinkType={() => setLinkOpen(false)}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setFullscreen((v) => !v)}
      {...args}
    />
  );
};

export const Editing: Story = { render: () => <Interactive /> };
export const ReadOnly: Story = {
  render: () => <Interactive canLink={false} />,
};
