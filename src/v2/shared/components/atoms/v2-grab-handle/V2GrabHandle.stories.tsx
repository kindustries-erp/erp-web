import type { Meta } from "@storybook/react";
import React from "react";
import { V2GrabHandle } from "./V2GrabHandle";

const meta: Meta<typeof V2GrabHandle> = {
  title: "Components/Atoms/Display/V2GrabHandle",
  component: V2GrabHandle,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <div className="w-80 rounded-t-2xl border border-border/80 bg-surface">
    <V2GrabHandle />
  </div>
);
