import type { Meta } from "@storybook/react";
import React from "react";
import { V2Tooltip } from "./V2Tooltip";
import { V2Button } from "../v2-button";

const meta: Meta<typeof V2Tooltip> = {
  title: "Components/Atoms/Display/V2Tooltip",
  component: V2Tooltip,
  tags: ["autodocs"],
};

export default meta;

export const Default = () => {
  return (
    <div className="flex gap-4 p-8">
      <V2Tooltip content="Lưu lại toàn bộ thay đổi vừa chỉnh sửa">
        <V2Button variant="default" size="sm">
          Lưu dữ liệu
        </V2Button>
      </V2Tooltip>
    </div>
  );
};

export const WithoutArrow = () => {
  return (
    <div className="flex gap-4 p-8">
      <V2Tooltip content="Tooltip không có mũi tên chỉ hướng" arrow={false}>
        <V2Button variant="outline" size="sm">
          Hover xem gợi ý
        </V2Button>
      </V2Tooltip>
    </div>
  );
};

export const DisabledState = () => {
  return (
    <div className="flex gap-4 p-8">
      <V2Tooltip content="Tooltip này sẽ không xuất hiện" disabled>
        <V2Button variant="ghost" size="sm">
          Nút bị tắt tooltip
        </V2Button>
      </V2Tooltip>
    </div>
  );
};
