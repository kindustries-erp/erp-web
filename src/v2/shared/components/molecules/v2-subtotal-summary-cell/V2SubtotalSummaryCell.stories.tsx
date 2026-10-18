import type { Meta } from "@storybook/react";
import React from "react";
import { V2SubtotalSummaryCell } from "./V2SubtotalSummaryCell";

const meta: Meta<typeof V2SubtotalSummaryCell> = {
  title: "Components/Molecules/Table/V2SubtotalSummaryCell",
  component: V2SubtotalSummaryCell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex w-72 justify-end rounded border border-border p-2 text-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const Quantity = () => (
  <V2SubtotalSummaryCell
    variant="qty"
    pageValue={1200}
    totalValue={5000}
    unit="kg"
  />
);
export const Amount = () => (
  <V2SubtotalSummaryCell
    variant="amount"
    pageValue={15000000}
    totalValue={90000000}
  />
);
export const Count = () => (
  <V2SubtotalSummaryCell variant="count" pageValue={20} totalValue={20} />
);
export const MultiPage = () => (
  <V2SubtotalSummaryCell
    variant="amount"
    pageValue={15000000}
    totalValue={90000000}
    page={3}
    totalPages={5}
    cumulativeValue={45000000}
  />
);
export const TotalDisplayMode = () => (
  <V2SubtotalSummaryCell
    variant="amount"
    pageValue={15000000}
    totalValue={90000000}
    displayMode="total"
  />
);
