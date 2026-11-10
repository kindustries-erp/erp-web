import type { Meta } from "@storybook/react";
import React from "react";
import { V2DrawerFieldGrid } from "./V2DrawerFieldGrid";

const meta: Meta<typeof V2DrawerFieldGrid> = {
  title: "Components/Molecules/V2DrawerFieldGrid",
  component: V2DrawerFieldGrid,
  tags: ["autodocs"],
};
export default meta;

const fields = [
  {
    key: "no",
    label: "Số phiếu",
    required: true,
    render: () => <span>GGR-001</span>,
  },
  { key: "date", label: "Ngày nhập", render: () => <span>2026-11-06</span> },
  {
    key: "remarks",
    label: "Ghi chú",
    className: "sm:col-span-2",
    render: () => <span>Nhận đủ hàng</span>,
  },
];

export const TwoColumns = () => <V2DrawerFieldGrid fields={fields} />;

export const OneColumn = () => (
  <V2DrawerFieldGrid fields={fields} columns={1} />
);

export const WithError = () => (
  <V2DrawerFieldGrid
    fields={[{ ...fields[0], error: "Trường này bắt buộc" }, fields[1]]}
    columns={1}
  />
);
