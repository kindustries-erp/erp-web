import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2TableSelectCheckbox } from "./V2TableSelectCheckbox";

const meta: Meta<typeof V2TableSelectCheckbox> = {
  title: "Components/Molecules/Table/V2TableSelectCheckbox",
  component: V2TableSelectCheckbox,
  tags: ["autodocs"],
};
export default meta;

export const Interactive = () => {
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <V2TableSelectCheckbox
      aria-label="Chọn dòng"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
};

export const Indeterminate = () => (
  <V2TableSelectCheckbox
    aria-label="Chọn tất cả"
    checked="indeterminate"
    onCheckedChange={() => {}}
  />
);
