import type { Meta, StoryObj } from "@storybook/react";
import { V2MobileAppearanceDrawer } from "./V2MobileAppearanceDrawer";

const meta: Meta<typeof V2MobileAppearanceDrawer> = {
  title: "Components/Organisms/V2MobileAppearanceDrawer",
  component: V2MobileAppearanceDrawer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2MobileAppearanceDrawer>;

export const Default: Story = {
  args: {
    open: true,
    currentTheme: "classic-light",
    onOpenChange: () => {},
    onThemeChange: () => {},
  },
};
