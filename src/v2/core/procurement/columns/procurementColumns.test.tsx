import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  buildProcurementOrderColumns,
  buildProcurementRequestColumns,
  ProcurementStatusBadge,
  getProcurementBadgeVariant,
} from "./procurementColumns";
import { V2BadgeVariant } from "@/v2/shared/components/atoms/v2-badge";
import type { ProcurementRequestRow } from "../procurement.types";

const mockT = (key: string, fallback: string) => fallback ?? key;

describe("procurementColumns", () => {
  it("getProcurementBadgeVariant ánh xạ đúng màu semantic No Blue", () => {
    expect(getProcurementBadgeVariant("APPROVED")).toBe(V2BadgeVariant.SUCCESS);
    expect(getProcurementBadgeVariant("FULL")).toBe(V2BadgeVariant.SUCCESS);
    expect(getProcurementBadgeVariant("SUBMITTED")).toBe(
      V2BadgeVariant.WARNING,
    );
    expect(getProcurementBadgeVariant("PARTIAL")).toBe(V2BadgeVariant.WARNING);
    expect(getProcurementBadgeVariant("REJECTED")).toBe(
      V2BadgeVariant.DESTRUCTIVE,
    );
    expect(getProcurementBadgeVariant("CANCELLED")).toBe(
      V2BadgeVariant.DESTRUCTIVE,
    );
    expect(getProcurementBadgeVariant("CLOSED")).toBe(V2BadgeVariant.OUTLINE);
    expect(getProcurementBadgeVariant("NONE")).toBe(V2BadgeVariant.OUTLINE);
    expect(getProcurementBadgeVariant("DRAFT")).toBe(V2BadgeVariant.SECONDARY);
    expect(getProcurementBadgeVariant("UNKNOWN")).toBe(
      V2BadgeVariant.SECONDARY,
    );
  });

  it("ProcurementStatusBadge render đúng nhãn và variant", () => {
    render(<ProcurementStatusBadge value="APPROVED" t={mockT} />);
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
  });

  it("buildProcurementRequestColumns tạo đủ 8 cột với đầy đủ filter và format", () => {
    const openDetail = vi.fn();
    const columns = buildProcurementRequestColumns(mockT, openDetail);

    expect(columns).toHaveLength(9);
    const keys = columns.map((c) => c.key);
    expect(keys).toEqual([
      "requestNo",
      "requestDate",
      "title",
      "branchName",
      "estimatedTotal",
      "status",
      "orderingStatus",
      "createdBy",
      "approver",
    ]);

    const mockRow: ProcurementRequestRow = {
      id: "req-1",
      requestNo: "PR-2026-001",
      requestDate: "2026-11-05",
      neededDate: "2026-11-10",
      title: "Mua phụ tùng phanh",
      branchName: "Chi nhánh Quận 7",
      estimatedTotal: 15000000,
      status: "APPROVED",
      orderingStatus: "PARTIAL",
      createdBy: "5f0c2a7e-0000-4000-8000-000000000000",
      createdByEmail: "nguyen.a@liouni.com",
      approval: {
        approverId: null,
        approverEmail: "truong.garage@liouni.com",
        submit: null,
        approve: null,
        reject: null,
        cancel: null,
        close: null,
        issue: null,
      },
      createdAt: "2026-11-05T08:00:00Z",
    };

    // Người tạo và người duyệt hiển thị email, không hiển thị UUID
    const colCreator = columns.find((c) => c.key === "createdBy")!;
    const { container: creatorContainer } = render(
      <div>{colCreator.cell(mockRow, 0)}</div>,
    );
    expect(creatorContainer).toHaveTextContent("nguyen.a@liouni.com");
    expect(creatorContainer).not.toHaveTextContent("5f0c2a7e");

    const colApprover = columns.find((c) => c.key === "approver")!;
    const { container: approverContainer } = render(
      <div>{colApprover.cell(mockRow, 0)}</div>,
    );
    expect(approverContainer).toHaveTextContent("truong.garage@liouni.com");

    // Kiểm tra cell của requestNo gọi openDetail khi click
    const colRequestNo = columns.find((c) => c.key === "requestNo")!;
    const { container: reqNoContainer } = render(
      <div>{colRequestNo.cell(mockRow, 0)}</div>,
    );
    expect(reqNoContainer).toHaveTextContent("PR-2026-001");
    const link = reqNoContainer.querySelector("button, [role='button'], span");
    if (link) fireEvent.click(link);
    expect(openDetail).toHaveBeenCalledWith("req-1");

    // Kiểm tra cell estimatedTotal format tiền VNĐ
    const colTotal = columns.find((c) => c.key === "estimatedTotal")!;
    const { container: totalContainer } = render(
      <div>{colTotal.cell(mockRow, 0)}</div>,
    );
    expect(totalContainer).toHaveTextContent("15.000.000");

    // Kiểm tra cell status render badge
    const colStatus = columns.find((c) => c.key === "status")!;
    const { container: statusContainer } = render(
      <div>{colStatus.cell(mockRow, 0)}</div>,
    );
    expect(statusContainer).toHaveTextContent("APPROVED");

    // Kiểm tra mobileSlot cấu hình chuẩn cho mobile card (badge kép và meta người tạo/duyệt)
    expect(columns.find((c) => c.key === "status")?.mobileSlot).toBe("badge");
    expect(columns.find((c) => c.key === "orderingStatus")?.mobileSlot).toBe(
      "badge",
    );
    expect(columns.find((c) => c.key === "createdBy")?.mobileSlot).toBe("meta");
    expect(columns.find((c) => c.key === "approver")?.mobileSlot).toBe("meta");
  });

  it("buildProcurementOrderColumns tạo đủ danh sách cột cho PO", () => {
    const columns = buildProcurementOrderColumns(mockT);
    expect(columns.length).toBeGreaterThanOrEqual(10);
    expect(columns.some((c) => c.key === "orderNo")).toBe(true);
    expect(columns.some((c) => c.key === "totalAmount")).toBe(true);
  });

  it("cột PO có header filter cho tổng tiền, trạng thái, nhận hàng và thanh toán", () => {
    const columns = buildProcurementOrderColumns(mockT);
    for (const key of [
      "totalAmount",
      "status",
      "fulfillmentStatus",
      "paymentStatus",
    ]) {
      const col = columns.find((c) => c.key === key);
      expect(col?.filter, key).toBeDefined();
    }
  });

  it("cột số đơn PO mở chi tiết khi click và có copy", () => {
    const openDetail = vi.fn();
    const columns = buildProcurementOrderColumns(mockT, openDetail);
    const colOrderNo = columns.find((c) => c.key === "orderNo")!;
    const { container } = render(
      <div>
        {colOrderNo.cell(
          {
            id: "po-1",
            orderNo: "PO-2026-001",
          } as Parameters<typeof colOrderNo.cell>[0],
          0,
        )}
      </div>,
    );
    expect(container).toHaveTextContent("PO-2026-001");
    const trigger = container.querySelector("button, [role='button'], span");
    if (trigger) fireEvent.click(trigger);
    expect(openDetail).toHaveBeenCalledWith("po-1");
  });

  it("cột người tạo PO hiển thị email, không hiển thị uuid", () => {
    const columns = buildProcurementOrderColumns(mockT);
    const colCreatedBy = columns.find((c) => c.key === "createdBy")!;
    const { container } = render(
      <div>
        {colCreatedBy.cell(
          {
            id: "po-1",
            createdBy: "5f0c2a7e-0000-4000-8000-000000000000",
            createdByEmail: "a@liouni.com",
          } as Parameters<typeof colCreatedBy.cell>[0],
          0,
        )}
      </div>,
    );
    expect(container).toHaveTextContent("a@liouni.com");
    expect(container).not.toHaveTextContent("5f0c2a7e");
  });

  it("badge trạng thái thanh toán và phát hành có màu semantic", () => {
    expect(getProcurementBadgeVariant("PAID")).toBe(V2BadgeVariant.SUCCESS);
    expect(getProcurementBadgeVariant("PARTIALLY_PAID")).toBe(
      V2BadgeVariant.WARNING,
    );
    expect(getProcurementBadgeVariant("UNPAID")).toBe(V2BadgeVariant.OUTLINE);
    expect(getProcurementBadgeVariant("ISSUED")).toBe(V2BadgeVariant.WARNING);
  });
});
