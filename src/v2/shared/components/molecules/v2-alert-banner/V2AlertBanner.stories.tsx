import type { Meta } from "@storybook/react";
import React from "react";
import { V2AlertBanner } from "./V2AlertBanner";

const meta: Meta<typeof V2AlertBanner> = {
  title: "Components/Molecules/Overlay & Menu/V2AlertBanner",
  component: V2AlertBanner,
  tags: ["autodocs"],
};
export default meta;

export const Error = () => (
  <V2AlertBanner>Không thể tải dữ liệu. Vui lòng thử lại.</V2AlertBanner>
);
