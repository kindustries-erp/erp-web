import type { Meta } from "@storybook/react";
import React from "react";
import { V2Spinner } from "./V2Spinner";

const meta: Meta<typeof V2Spinner> = {
  title: "Components/Atoms/Display/V2Spinner",
  component: V2Spinner,
  tags: ["autodocs"],
};
export default meta;

export const Medium = () => <V2Spinner aria-label="Đang tải" />;
export const Small = () => <V2Spinner aria-label="Đang tải" size="sm" />;
