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

    expect(columns).toHaveLength(8);
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
      createdBy: "Nguyen Van A",
      createdAt: "2026-11-05T08:00:00Z",
    };

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
  });

  it("buildProcurementOrderColumns tạo đủ danh sách cột cho PO", () => {
    const columns = buildProcurementOrderColumns(mockT);
    expect(columns.length).toBeGreaterThanOrEqual(10);
    expect(columns.some((c) => c.key === "orderNo")).toBe(true);
    expect(columns.some((c) => c.key === "totalAmount")).toBe(true);
  });
});
