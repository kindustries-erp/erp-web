import type { Meta } from "@storybook/react";
import React from "react";
import { DownloadCloud } from "lucide-react";
import { V2SplitButton } from "./V2SplitButton";

const meta: Meta<typeof V2SplitButton> = {
  title: "Components/Molecules/Overlay & Menu/V2SplitButton",
  component: V2SplitButton,
  tags: ["autodocs"],
};
export default meta;

export const MainOnly = () => (
  <V2SplitButton
    label="Đồng bộ"
    icon={<DownloadCloud className="h-4 w-4" />}
    onClick={() => {}}
  />
);
export const WithMenu = () => (
  <V2SplitButton
    label="Đồng bộ"
    icon={<DownloadCloud className="h-4 w-4" />}
    onClick={() => {}}
    renderMenu={(trigger) => <div className="inline-flex">{trigger}</div>}
  />
);
