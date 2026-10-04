import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2Modal } from "./V2Modal";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

const meta: Meta<typeof V2Modal> = {
  title: "V2/Molecules/V2Modal",
  component: V2Modal,
  tags: ["autodocs"],
};

export default meta;

export const DefaultMedium = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button onClick={() => setOpen(true)}>Mở Modal (Size MD)</V2Button>
      <V2Modal
        open={open}
        onOpenChange={setOpen}
        title="Thông tin chi tiết đối tác"
        description="Quản lý hồ sơ nhà cung cấp hoặc khách hàng doanh nghiệp."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <V2Button variant="secondary" onClick={() => setOpen(false)}>
              Hủy
            </V2Button>
            <V2Button variant="primary" onClick={() => setOpen(false)}>
              Lưu thay đổi
            </V2Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs text-muted-fg font-medium">
              Tên đối tác
            </label>
            <input
              className="w-full mt-1 px-3 py-1.5 rounded-md border border-border bg-surface text-foreground text-sm outline-none"
              defaultValue="Công ty TNHH Liouni Technology"
            />
          </div>
          <div>
            <label className="text-xs text-muted-fg font-medium">
              Mã số thuế
            </label>
            <input
              className="w-full mt-1 px-3 py-1.5 rounded-md border border-border bg-surface text-foreground text-sm outline-none"
              defaultValue="0312345678"
            />
          </div>
        </div>
      </V2Modal>
    </div>
  );
};

export const SmallModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button variant="outline" onClick={() => setOpen(true)}>
        Mở Modal Nhỏ (Size SM)
      </V2Button>
      <V2Modal
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Nhắc nhở cập nhật"
        description="Vui lòng kiểm tra lại thông tin trước khi tiếp tục."
        footer={
          <V2Button variant="primary" fullWidth onClick={() => setOpen(false)}>
            Đã hiểu
          </V2Button>
        }
      >
        <p className="text-xs text-muted-fg leading-relaxed">
          Hệ thống sẽ đồng bộ dữ liệu hóa đơn thuế trong vòng 2 phút tới.
        </p>
      </V2Modal>
    </div>
  );
};

export const LargeModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button variant="secondary" onClick={() => setOpen(true)}>
        Mở Modal Lớn (Size LG)
      </V2Button>
      <V2Modal
        open={open}
        onOpenChange={setOpen}
        size="lg"
        title="Danh sách chứng từ đối soát"
        description="Xem trước toàn bộ các dòng giao dịch ngân hàng khớp hóa đơn."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <V2Button variant="secondary" onClick={() => setOpen(false)}>
              Đóng
            </V2Button>
            <V2Button variant="primary" onClick={() => setOpen(false)}>
              Xác nhận đối soát
            </V2Button>
          </div>
        }
      >
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex justify-between p-2.5 rounded-lg border border-border bg-surface/50 text-xs"
            >
              <span className="font-mono text-foreground">UNC-2026100{i}</span>
              <span className="font-semibold text-foreground">
                15,000,000 đ
              </span>
            </div>
          ))}
        </div>
      </V2Modal>
    </div>
  );
};
