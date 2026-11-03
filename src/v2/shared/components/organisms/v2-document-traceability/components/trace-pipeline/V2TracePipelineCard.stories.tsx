import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { V2TracePipelineCard } from "./V2TracePipelineCard";
import "../../traceability.locale";
import { TRACEABILITY_MOCK_NODE } from "../../mocks/traceability.mock";

const meta: Meta<typeof V2TracePipelineCard> = {
  title: "Components/Organisms/V2TracePipelineCard",
  component: V2TracePipelineCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TracePipelineCard>;

export const Editable: Story = {
  args: {
    node: TRACEABILITY_MOCK_NODE,
    allowEdit: true,
    onOpen: () => undefined,
    onUnlink: () => undefined,
  },
};
export const Restricted: Story = {
  args: {
    node: {
      ...TRACEABILITY_MOCK_NODE,
      restricted: true,
      requiredResource: "bank",
    },
    allowEdit: false,
    onOpen: () => undefined,
  },
};
