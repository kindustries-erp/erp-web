import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { V2ConfirmModal } from "./V2ConfirmModal";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

const meta: Meta<typeof V2ConfirmModal> = {
  title: "Components/Molecules/Overlay & Menu/V2ConfirmModal",
  component: V2ConfirmModal,
  tags: ["autodocs"],
};

export default meta;

export const DangerDelete = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setOpen(false);
  };

  return (
    <div>
      <V2Button variant="destructive" onClick={() => setOpen(true)}>
        Xóa tài khoản
      </V2Button>
      <V2ConfirmModal
        open={open}
        variant="danger"
        title="Xác nhận xóa tài khoản"
        message="Hành động này không thể hoàn tác. Toàn bộ dữ liệu phiên làm việc sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy bỏ"
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};

export const WarningAction = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button variant="outline" onClick={() => setOpen(true)}>
        Đóng phiếu khi chưa lưu
      </V2Button>
      <V2ConfirmModal
        open={open}
        variant="warning"
        title="Thay đổi chưa được lưu"
        message="Bạn có những thông tin sửa đổi chưa bấm lưu. Nếu thoát ngay bây giờ, các thay đổi sẽ bị mất."
        confirmLabel="Rời khỏi trang"
        cancelLabel="Ở lại chỉnh sửa"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};

export const PrimaryConfirm = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <V2Button variant="primary" onClick={() => setOpen(true)}>
        Xác nhận bàn giao xe
      </V2Button>
      <V2ConfirmModal
        open={open}
        variant="primary"
        title="Bàn giao xe & Kích hoạt bảo hành"
        message="Hệ thống sẽ cập nhật trạng thái xe thành Đã bán và kích hoạt sổ bảo hành điện tử cho khách hàng."
        confirmLabel="Đồng ý bàn giao"
        cancelLabel="Kiểm tra lại"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};
