import type { Meta, StoryObj } from "@storybook/react";
import { V2TracePipeline } from "./V2TracePipeline";
import "../../traceability.locale";
import { TRACEABILITY_MOCK_GRAPH } from "../../mocks/traceability.mock";

const meta: Meta<typeof V2TracePipeline> = {
  title: "Components/Organisms/V2TracePipeline",
  component: V2TracePipeline,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2TracePipeline>;

export const Editing: Story = {
  args: {
    graph: TRACEABILITY_MOCK_GRAPH,
    allowEdit: true,
    onAddLink: () => undefined,
    onUnlinkNode: () => undefined,
  },
};
export const ReadOnly: Story = {
  args: { graph: TRACEABILITY_MOCK_GRAPH, allowEdit: false },
};
