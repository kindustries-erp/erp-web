import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2TraceTable } from "./V2TraceTable";
import "../../traceability.locale";
import { TRACEABILITY_MOCK_GRAPH } from "../../mocks/traceability.mock";

const meta: Meta<typeof V2TraceTable> = {
  title: "Components/Organisms/V2TraceTable",
  component: V2TraceTable,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2TraceTable>;

export const Editing: Story = {
  args: {
    graph: TRACEABILITY_MOCK_GRAPH,
    allowEdit: true,
    onUnlinkNode: () => undefined,
    onOpenDocument: () => undefined,
  },
};
export const ReadOnly: Story = {
  args: { graph: TRACEABILITY_MOCK_GRAPH, allowEdit: false },
};
