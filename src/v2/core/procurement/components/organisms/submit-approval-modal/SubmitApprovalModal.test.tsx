import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmitApprovalModal } from "./SubmitApprovalModal";

describe("SubmitApprovalModal", () => {
  it("hiện tiêu đề và không cho xác nhận khi chưa chọn người duyệt", () => {
    render(
      <SubmitApprovalModal
        open
        rowLabel="GDNM-001"
        approvers={[{ id: "u2", email: "boss@liouni.com" }]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("GDNM-001")).toBeInTheDocument();
    expect(screen.getByText("Người duyệt")).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: /Gửi duyệt/ });
    expect(confirm).toBeDisabled();
  });

  it("không render nội dung khi đóng", () => {
    render(
      <SubmitApprovalModal
        open={false}
        rowLabel="GDNM-001"
        approvers={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText("GDNM-001")).not.toBeInTheDocument();
  });

  it("render thẻ thông tin tóm tắt và gọi onViewDetail khi bấm icon xem chi tiết", () => {
    const onViewDetail = vi.fn();
    render(
      <SubmitApprovalModal
        open
        rowLabel="GDNM-001"
        target={{
          requestNo: "GDNM-001",
          title: "Mua phụ tùng thay thế",
          requestDate: "2026-11-06",
          estimatedTotal: 450000,
          createdByEmail: "ai-test-tao@example.com",
        }}
        approvers={[{ id: "u2", email: "boss@liouni.com" }]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onViewDetail={onViewDetail}
      />,
    );
    expect(screen.getByText("Mua phụ tùng thay thế")).toBeInTheDocument();
    expect(screen.getByText("ai-test-tao@example.com")).toBeInTheDocument();
    const viewBtn = screen.getByRole("button", {
      name: /Xem chi tiết phiếu trong Drawer/i,
    });
    viewBtn.click();
    expect(onViewDetail).toHaveBeenCalledTimes(1);

    // Bấm trực tiếp vào số phiếu cũng gọi onViewDetail để mở Drawer
    const docNoBtn = screen.getByRole("button", { name: "GDNM-001" });
    docNoBtn.click();
    expect(onViewDetail).toHaveBeenCalledTimes(2);

    // Có nút sao chép mã phiếu
    expect(
      screen.getByRole("button", { name: /Sao chép mã phiếu/i }),
    ).toBeInTheDocument();
  });
});
