import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2DocumentTraceability } from "./V2DocumentTraceability";
import "../../traceability.locale";
import { TRACEABILITY_MOCK_GRAPH } from "../../mocks/traceability.mock";

const meta: Meta<typeof V2DocumentTraceability> = {
  title: "Components/Organisms/V2DocumentTraceability",
  component: V2DocumentTraceability,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="w-[960px]">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2DocumentTraceability>;

export const Editing: Story = {
  args: {
    rootId: "root",
    graphData: TRACEABILITY_MOCK_GRAPH,
    editMode: true,
    onAddLink: () => undefined,
    onUnlinkNode: () => undefined,
    onOpenDocument: () => undefined,
  },
};
export const ReadOnly: Story = {
  args: { rootId: "root", graphData: TRACEABILITY_MOCK_GRAPH, editMode: false },
};
