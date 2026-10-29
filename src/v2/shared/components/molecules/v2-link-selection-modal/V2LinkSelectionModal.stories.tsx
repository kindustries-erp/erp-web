import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2LinkSelectionModal } from "./V2LinkSelectionModal";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import "@/v2/modules/finance-invoice/components/organisms/invoice-link-selection/invoice-link-selection.locale";

const meta: Meta<typeof V2LinkSelectionModal> = {
  title: "Components/Molecules/V2LinkSelectionModal",
  component: V2LinkSelectionModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2LinkSelectionModal>;

const Demo = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <V2Button onClick={() => setOpen(true)}>Mở</V2Button>
      <V2LinkSelectionModal
        open={open}
        onClose={() => setOpen(false)}
        title="Chọn đơn mua hàng (PO)"
      >
        <p className="text-sm text-muted-fg">Nội dung bảng chọn chứng từ.</p>
      </V2LinkSelectionModal>
    </>
  );
};

export const Default: Story = { render: () => <Demo /> };
