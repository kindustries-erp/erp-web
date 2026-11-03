import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { V2TraceStageGroup } from "./V2TraceStageGroup";
import "../../traceability.locale";
import { TRACEABILITY_STAGES } from "../../constants/traceability.constants";

const meta: Meta<typeof V2TraceStageGroup> = {
  title: "Components/Organisms/V2TraceStageGroup",
  component: V2TraceStageGroup,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: 330, height: 220 }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceStageGroup>;

const stage = TRACEABILITY_STAGES[1];
const asProps = (extra = {}) =>
  ({
    id: "stage-group-INVOICE",
    data: {
      stage,
      count: 2,
      allowEdit: true,
      actions: { onAddLink: () => undefined },
      ...extra,
    },
  }) as never;

export const Editing: Story = { args: asProps() as never };
export const ReadOnly: Story = { args: asProps({ allowEdit: false }) as never };
