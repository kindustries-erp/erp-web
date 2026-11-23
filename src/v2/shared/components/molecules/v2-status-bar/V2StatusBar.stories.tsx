import type { Meta, StoryObj } from "@storybook/react";
import { V2StatusBar } from "./V2StatusBar";

const meta: Meta<typeof V2StatusBar> = {
  title: "Components/Molecules/V2StatusBar",
  component: V2StatusBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof V2StatusBar>;

export const Default: Story = {
  args: {
    breadcrumbs: [{ label: "Bán hàng" }, { label: "Đơn bán hàng" }],
    branchName: "Chi nhánh Sài Gòn",
    companyName: "Enterprise HQ",
  },
};

export const WithStatusActions: Story = {
  args: {
    ...Default.args,
    statusActions: <span className="text-xs text-muted-fg">Sync OK</span>,
  },
};

export const WithoutEnvIndicator: Story = {
  args: { ...Default.args, showEnvIndicator: false },
};
