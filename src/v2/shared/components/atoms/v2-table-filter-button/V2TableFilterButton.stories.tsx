import type { Meta } from "@storybook/react";
import React from "react";
import { V2TableFilterButton } from "./V2TableFilterButton";

const meta: Meta<typeof V2TableFilterButton> = {
  title: "V2/Atoms/V2TableFilterButton",
  component: V2TableFilterButton,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => <V2TableFilterButton />;
export const WithActiveFilters = () => <V2TableFilterButton activeCount={2} />;
