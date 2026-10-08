import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2ViewModeCombobox } from "./V2ViewModeCombobox";

const meta: Meta<typeof V2ViewModeCombobox> = {
  title: "V2/Molecules/V2ViewModeCombobox",
  component: V2ViewModeCombobox,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => {
  const [active, setActive] = useState("overview");
  return (
    <V2ViewModeCombobox
      items={[
        { key: "overview", label: "Tổng quan", isSystem: true },
        { key: "tax", label: "Thuế", isSystem: true },
        { key: "mine", label: "Của tôi" },
      ]}
      activeKey={active}
      onSelect={setActive}
      onCreate={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  );
};
