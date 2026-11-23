import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcurementApproveModal } from "./ProcurementApproveModal";

describe("ProcurementApproveModal", () => {
  it("hiển thị thông tin tóm tắt và kích hoạt callback khi bấm Duyệt", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onViewDetail = vi.fn();

    render(
      <ProcurementApproveModal
        open
        rowLabel="GDNM-20261106-001"
        target={{
          requestNo: "GDNM-20261106-001",
          title: "Đề nghị mua vật tư Garage",
          requestDate: "2026-11-06",
          estimatedTotal: 2500000,
          createdByEmail: "ai-test-tao@example.com",
        }}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onViewDetail={onViewDetail}
      />,
    );

    expect(screen.getByText("Duyệt đề nghị mua hàng")).toBeInTheDocument();
    expect(screen.getByText("Đề nghị mua vật tư Garage")).toBeInTheDocument();
    expect(screen.getByText("ai-test-tao@example.com")).toBeInTheDocument();

    const viewBtn = screen.getByRole("button", {
      name: /Xem chi tiết phiếu trong Drawer/i,
    });
    viewBtn.click();
    expect(onViewDetail).toHaveBeenCalledTimes(1);

    // Bấm trực tiếp vào số phiếu cũng gọi onViewDetail
    const docNoBtn = screen.getByRole("button", { name: "GDNM-20261106-001" });
    docNoBtn.click();
    expect(onViewDetail).toHaveBeenCalledTimes(2);

    const approveBtn = screen.getByRole("button", { name: /^Duyệt$/i });
    approveBtn.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("không hiển thị nội dung khi modal đóng", () => {
    render(
      <ProcurementApproveModal
        open={false}
        rowLabel="GDNM-001"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Duyệt đề nghị mua hàng"),
    ).not.toBeInTheDocument();
  });
});
