import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2DrawerSheet } from "./V2DrawerSheet";

const meta: Meta<typeof V2DrawerSheet> = {
  title: "Components/Molecules/Overlay & Menu/V2DrawerSheet",
  component: V2DrawerSheet,
  tags: ["autodocs"],
};
export default meta;

export const Floating = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <V2Button onClick={() => setOpen(true)}>Mở drawer</V2Button>
      <V2DrawerSheet
        open={open}
        side="floating"
        title="Chi tiết"
        onRequestClose={() => setOpen(false)}
      >
        <div className="p-4 text-sm">Nội dung drawer</div>
      </V2DrawerSheet>
    </>
  );
};
