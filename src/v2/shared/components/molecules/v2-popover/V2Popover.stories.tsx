import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2Popover } from "./V2Popover";
import { V2Button } from "../../atoms/v2-button";

const meta: Meta<typeof V2Popover> = {
  title: "Components/Molecules/Overlay & Menu/V2Popover",
  component: V2Popover,
  tags: ["autodocs"],
};

export default meta;

export const Default = () => {
  return (
    <div className="p-12">
      <V2Popover
        title="Tùy chọn hiển thị"
        content={
          <div className="space-y-3">
            <p className="text-muted-fg">
              Cấu hình các cột hiển thị trong danh sách hóa đơn.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <V2Button variant="outline" size="xs">
                Đặt lại
              </V2Button>
              <V2Button variant="default" size="xs">
                Áp dụng
              </V2Button>
            </div>
          </div>
        }
      >
        <V2Button variant="default" size="sm">
          Mở tùy chọn
        </V2Button>
      </V2Popover>
    </div>
  );
};

export const Controlled = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-12 space-y-4">
      <div className="text-xs text-muted-fg">
        Trạng thái: {open ? "Đang mở" : "Đã đóng"}
      </div>
      <V2Popover
        open={open}
        onOpenChange={setOpen}
        title="Bộ lọc ngày hạch toán"
        content={
          <div className="space-y-2">
            <div>Chọn khoảng thời gian tra cứu chứng từ kho.</div>
            <V2Button
              variant="default"
              size="xs"
              fullWidth
              onClick={() => setOpen(false)}
            >
              Xác nhận & Đóng
            </V2Button>
          </div>
        }
      >
        <V2Button variant="outline" size="sm">
          Chọn ngày
        </V2Button>
      </V2Popover>
    </div>
  );
};
