import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { V2TraceNodeHandles } from "./V2TraceNodeHandles";

const meta: Meta<typeof V2TraceNodeHandles> = {
  title: "Components/Organisms/V2TraceNodeHandles",
  component: V2TraceNodeHandles,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div className="relative h-16 w-40 rounded border">
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
};
export default meta;

export const Default: StoryObj<typeof V2TraceNodeHandles> = {};
