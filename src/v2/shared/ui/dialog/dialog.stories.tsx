import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/UI Primitives/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-primary-fg rounded-md text-sm font-medium cursor-pointer"
        >
          Mở Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tiêu đề Dialog Mẫu</DialogTitle>
          <DialogDescription>
            Hộp thoại nguyên tử (Primitive) với hiệu ứng kính mờ và thiết kế V2
            chuẩn.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-foreground">
          Nội dung mẫu hiển thị trực quan trong không gian màu ngữ cảnh HSL.
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs cursor-pointer"
            >
              Đóng
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const WithoutCloseButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="px-4 py-2 border border-border rounded-md text-sm font-medium cursor-pointer"
        >
          Không có nút X
        </button>
      </DialogTrigger>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Dialog Không Có Nút Đóng X</DialogTitle>
          <DialogDescription>
            Chỉ đóng được bằng nút hành động hoặc phím Escape.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-foreground">
          Phù hợp cho các hộp thoại bắt buộc người dùng ra quyết định rõ ràng.
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              className="px-3 py-1.5 bg-primary text-primary-fg rounded-md text-xs cursor-pointer"
            >
              Đã hiểu
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
