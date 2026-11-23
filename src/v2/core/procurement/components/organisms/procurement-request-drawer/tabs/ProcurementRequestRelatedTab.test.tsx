import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProcurementRequestRelatedTab } from "./ProcurementRequestRelatedTab";
import type { ProcurementRequestDetail } from "../../../../procurement.types";

const mockDetail: ProcurementRequestDetail = {
  id: "pr-1",
  requestNo: "PR-2026-001",
  requestDate: "2026-11-05",
  neededDate: null,
  title: "Đề nghị mua",
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  status: "APPROVED",
  orderingStatus: "PARTIAL",
  estimatedTotal: "0",
  remarks: null,
  createdBy: "boss",
  lines: [],
  createdAt: "2026-11-05T10:00:00Z",
};

describe("ProcurementRequestRelatedTab", () => {
  it("render V2EmptyState khi detail là undefined", () => {
    render(<ProcurementRequestRelatedTab />);
    expect(screen.getByText("Chưa có chứng từ liên kết")).toBeDefined();
  });

  it("render thông tin tiến độ đặt hàng và DrawerRelatedDeck", () => {
    render(<ProcurementRequestRelatedTab detail={mockDetail} />);
    expect(screen.getByText("Tiến độ đặt hàng")).toBeDefined();
    expect(screen.getByText("Chi nhánh Quận 1")).toBeDefined();
    expect(screen.getByText("Đơn mua hàng")).toBeDefined();
  });

  it("kích hoạt nút tạo PO khi đề nghị đã APPROVED và chưa FULL", async () => {
    const handleOrder = vi.fn();
    render(
      <ProcurementRequestRelatedTab
        detail={mockDetail}
        canCreateOrder
        onOrderFromRequest={handleOrder}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Lập đơn mua từ đề nghị này/i,
    });
    expect(button).toBeDefined();
    await userEvent.click(button);
    expect(handleOrder).toHaveBeenCalled();
  });
});
