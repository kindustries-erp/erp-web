import type { Meta, StoryObj } from "@storybook/react";
import { V2EnvStamp } from "./V2EnvStamp";

const meta: Meta<typeof V2EnvStamp> = {
  title: "Components/Molecules/Feedback & Overlay/V2EnvStamp",
  component: V2EnvStamp,
  tags: ["autodocs"],
  argTypes: {
    forcedEnv: {
      control: "select",
      options: ["prod-dev", "local", "klotus", "greenway", "blueway", "dev"],
    },
    customLabel: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2EnvStamp>;

export const LocalProdData: Story = {
  args: {
    forcedEnv: "prod-dev",
    customLabel: "⚠️ GREENWAY (PROD DATA)",
  },
};

export const LocalDevelopment: Story = {
  args: {
    forcedEnv: "local",
    customLabel: "💻 LOCAL DEV",
  },
};

export const GreenwayStaging: Story = {
  args: {
    forcedEnv: "greenway",
    customLabel: "GREENWAY DEMO",
  },
};

export const CustomLabel: Story = {
  args: {
    customLabel: "STAGING DEMO",
  },
};
