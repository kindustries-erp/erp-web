import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcurementAlreadyDecidedModal } from "./ProcurementAlreadyDecidedModal";

describe("ProcurementAlreadyDecidedModal", () => {
  it("hiển thị nhãn chứng từ và trạng thái hiện tại, bấm Đã hiểu thì đóng", () => {
    const onClose = vi.fn();

    render(
      <ProcurementAlreadyDecidedModal
        target={{ rowLabel: "GDNM-20261106-001", status: "APPROVED" }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Chứng từ đã được xử lý")).toBeInTheDocument();
    expect(screen.getByText("GDNM-20261106-001")).toBeInTheDocument();
    // Nhãn trạng thái lấy từ locale procurement (nạp qua index); test này chỉ cần thấy trạng thái
    expect(screen.getByText(/Trạng thái hiện tại:/)).toHaveTextContent(
      /APPROVED|Đã duyệt/,
    );

    screen.getByRole("button", { name: "Đã hiểu" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("không hiển thị khi không có chứng từ", () => {
    render(<ProcurementAlreadyDecidedModal target={null} onClose={vi.fn()} />);
    expect(
      screen.queryByText("Chứng từ đã được xử lý"),
    ).not.toBeInTheDocument();
  });
});
