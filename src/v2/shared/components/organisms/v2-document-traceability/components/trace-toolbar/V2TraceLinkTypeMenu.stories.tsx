import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2TraceLinkTypeMenu } from "./V2TraceLinkTypeMenu";
import "../../traceability.locale";

const meta: Meta<typeof V2TraceLinkTypeMenu> = {
  title: "Components/Organisms/V2TraceLinkTypeMenu",
  component: V2TraceLinkTypeMenu,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2TraceLinkTypeMenu>;

const Demo = ({
  types,
}: {
  types: React.ComponentProps<typeof V2TraceLinkTypeMenu>["types"];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <V2TraceLinkTypeMenu
      types={types}
      open={open}
      onOpenChange={setOpen}
      onSelect={() => setOpen(false)}
    />
  );
};

export const SeveralTypes: Story = {
  render: () => (
    <Demo
      types={["BANK_TXN", "PURCHASE_ORDER", "SALES_ORDER", "GARAGE_CASE"]}
    />
  ),
};
export const SingleType: Story = {
  render: () => <Demo types={["GARAGE_CASE"]} />,
};
