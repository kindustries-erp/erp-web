import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
} from "./popover";

const meta: Meta<typeof Popover> = {
  title: "Components/UI Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;

export const Default = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-fg rounded-md text-sm font-medium cursor-pointer"
        >
          Mở Popover
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm leading-none">Cài đặt hiển thị</h4>
          <p className="text-xs text-muted-fg leading-relaxed">
            Tùy chỉnh thông số giao diện và bộ lọc dữ liệu nhanh.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const WithArrowAndClose = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="px-4 py-2 border border-border rounded-md text-sm font-medium cursor-pointer"
        >
          Tùy chọn nâng cao
        </button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverArrow />
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground">
            Bộ lọc phân hệ
          </div>
          <div className="text-xs text-muted-fg">
            Áp dụng cho danh sách hóa đơn và sao kê tài khoản ngân hàng.
          </div>
          <div className="pt-2 flex justify-end">
            <PopoverClose asChild>
              <button
                type="button"
                className="px-3 py-1 bg-surface-hover border border-border text-foreground text-xs rounded cursor-pointer"
              >
                Đóng
              </button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
