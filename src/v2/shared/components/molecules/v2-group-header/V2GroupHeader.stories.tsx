import type { Meta } from "@storybook/react";
import React from "react";
import { V2GroupHeader } from "./V2GroupHeader";

const meta: Meta<typeof V2GroupHeader> = {
  title: "Components/Molecules/Overlay & Menu/V2GroupHeader",
  component: V2GroupHeader,
  tags: ["autodocs"],
};
export default meta;

export const Badge = () => <V2GroupHeader title="Quyền đọc" count={12} />;

export const Subtle = () => (
  <V2GroupHeader title="Quyền ghi" count={4} variant="subtle" />
);

export const Plain = () => <V2GroupHeader title="Quyền xóa" variant="plain" />;

export const WithAction = () => (
  <V2GroupHeader
    title="Nhóm quyền"
    count={3}
    action={<button type="button">Chọn tất cả</button>}
  />
);
