import type { Meta } from "@storybook/react";
import React from "react";
import { V2PageButton } from "./V2PageButton";

const meta: Meta<typeof V2PageButton> = {
  title: "V2/Atoms/V2PageButton",
  component: V2PageButton,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => <V2PageButton>2</V2PageButton>;
export const Active = () => <V2PageButton active>1</V2PageButton>;
export const Disabled = () => <V2PageButton disabled>‹</V2PageButton>;
export const Row = () => (
  <div className="flex gap-1">
    <V2PageButton disabled>‹</V2PageButton>
    <V2PageButton active>1</V2PageButton>
    <V2PageButton>2</V2PageButton>
    <V2PageButton>3</V2PageButton>
    <span className="px-1 text-xs text-muted-fg">…</span>
    <V2PageButton>42</V2PageButton>
    <V2PageButton>›</V2PageButton>
  </div>
);
