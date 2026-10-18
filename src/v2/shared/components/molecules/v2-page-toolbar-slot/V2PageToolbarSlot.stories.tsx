import type { Meta } from "@storybook/react";
import React from "react";
import { V2PageToolbarSlot } from "./V2PageToolbarSlot";

const meta: Meta<typeof V2PageToolbarSlot> = {
  title: "Components/Molecules/Header & Account/V2PageToolbarSlot",
  component: V2PageToolbarSlot,
  tags: ["autodocs"],
};
export default meta;

export const Active = () => (
  <V2PageToolbarSlot tabKey="in" active register={() => {}} />
);

export const Inactive = () => (
  <V2PageToolbarSlot tabKey="out" active={false} register={() => {}} />
);
