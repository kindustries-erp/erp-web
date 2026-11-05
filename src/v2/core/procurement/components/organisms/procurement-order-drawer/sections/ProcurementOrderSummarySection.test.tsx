import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProcurementOrderSummarySection } from "./ProcurementOrderSummarySection";
import type { ProcurementOrderDetail } from "../../../../procurement.types";

const detail = {
  id: "po-1",
  orderNo: "PO-2026-001",
  status: "APPROVED",
  fulfillmentStatus: "NONE",
  paymentStatus: "UNPAID",
  createdBy: "Thủ kho",
  requestId: "pr-1",
} as unknown as ProcurementOrderDetail;

describe("ProcurementOrderSummarySection", () => {
  it("hiển thị các dòng tổng quan đơn mua", () => {
    render(
      <ProcurementOrderSummarySection
        form={{ lines: [], requestId: null }}
        detail={detail}
      />,
    );
    expect(screen.getByText("Tổng tiền")).toBeDefined();
    expect(screen.getByText("Tổng đã duyệt")).toBeDefined();
    expect(screen.getByText("Tổng quan")).toBeDefined();
  });

  it("không hiển thị dòng 'Từ đề nghị mua' khi đơn lập tay (không có requestId)", () => {
    render(
      <ProcurementOrderSummarySection
        form={{ lines: [], requestId: null }}
        detail={detail}
      />,
    );
    expect(screen.queryByText("Từ đề nghị mua")).toBeNull();
  });
});
