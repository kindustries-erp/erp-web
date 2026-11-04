import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../../purchaseOrders.locale";
import { PurchaseOrderStatus } from "../../../domain/purchaseOrderConstants";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";

describe("PurchaseOrderStatusBadge", () => {
  it.each([
    [PurchaseOrderStatus.DRAFT, "Nháp"],
    [PurchaseOrderStatus.APPROVED, "Đã duyệt"],
    [PurchaseOrderStatus.CONFIRMED, "Đã xác nhận"],
    [PurchaseOrderStatus.PARTIAL_RECEIVED, "Nhận một phần"],
    [PurchaseOrderStatus.RECEIVED, "Đã nhận đủ"],
    [PurchaseOrderStatus.CANCELLED, "Đã hủy"],
  ])("hiển thị nhãn đúng cho %s", (status, label) => {
    render(<PurchaseOrderStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
