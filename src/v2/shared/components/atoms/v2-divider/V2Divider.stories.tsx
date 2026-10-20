import type { Meta } from "@storybook/react";
import React from "react";
import { V2Divider } from "./V2Divider";

const meta: Meta<typeof V2Divider> = {
  title: "Components/Atoms/Display/V2Divider",
  component: V2Divider,
  tags: ["autodocs"],
};
export default meta;

export const Vertical = () => (
  <div className="flex h-6 items-center gap-2 text-xs">
    <span>Mục 1</span>
    <V2Divider />
    <span>Mục 2</span>
  </div>
);

export const Horizontal = () => (
  <div className="w-48">
    <V2Divider orientation="horizontal" />
  </div>
);
