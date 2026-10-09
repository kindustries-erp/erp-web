import type { Meta } from "@storybook/react";
import React from "react";
import { ClipboardList } from "lucide-react";
import { V2PageIcon } from "./V2PageIcon";

const meta: Meta<typeof V2PageIcon> = {
  title: "Components/Atoms/Display/V2PageIcon",
  component: V2PageIcon,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <V2PageIcon>
    <ClipboardList className="h-5 w-5" />
  </V2PageIcon>
);
