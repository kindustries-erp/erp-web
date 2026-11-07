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
});
