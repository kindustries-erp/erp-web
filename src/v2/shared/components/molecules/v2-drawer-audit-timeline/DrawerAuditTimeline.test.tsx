import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DrawerAuditTimeline } from "./DrawerAuditTimeline";
import type { DrawerAuditItem } from "./DrawerAuditTimeline.type";

const MOCK_ITEMS: DrawerAuditItem[] = [
  {
    id: "1",
    action: "Tạo mới chứng từ",
    actor: "Admin",
    timestamp: "10:30 04/10/2026",
    details: "Khởi tạo phiếu kho NK-20261004-001",
    variant: "success",
  },
  {
    id: "2",
    action: "Cập nhật đơn giá",
    actor: "Kế toán",
    timestamp: "11:15 04/10/2026",
    details: "Điều chỉnh đơn giá mục số 2",
    variant: "warning",
  },
];

describe("V2 DrawerAuditTimeline Molecule", () => {
  it("renders timeline events with action, actor, timestamp, and details", () => {
    render(<DrawerAuditTimeline items={MOCK_ITEMS} />);

    expect(screen.getByText("Tạo mới chứng từ")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("10:30 04/10/2026")).toBeInTheDocument();
    expect(
      screen.getByText("Khởi tạo phiếu kho NK-20261004-001"),
    ).toBeInTheDocument();

    expect(screen.getByText("Cập nhật đơn giá")).toBeInTheDocument();
    expect(screen.getByText("Kế toán")).toBeInTheDocument();
  });

  it("renders empty message when items list is empty", () => {
    render(
      <DrawerAuditTimeline
        items={[]}
        emptyMessage="Không có dữ liệu lịch sử"
      />,
    );

    expect(screen.getByText("Không có dữ liệu lịch sử")).toBeInTheDocument();
  });

  it("layout stacked: hành động, tác nhân và thời gian tách thành các dòng riêng", () => {
    const { container } = render(
      <DrawerAuditTimeline
        layout="stacked"
        items={[
          {
            id: "s1",
            action: "Đã hủy",
            actor: "Trưởng garage",
            timestamp: "06/11/2026 13:39",
            details: "Lý do: Test hủy",
            badge: <span>Đã hủy</span>,
            variant: "danger",
          },
        ]}
      />,
    );
    expect(screen.getByText("Trưởng garage")).toBeInTheDocument();
    expect(screen.getByText("06/11/2026 13:39")).toBeInTheDocument();
    expect(screen.getByText("Lý do: Test hủy")).toBeInTheDocument();
    // Tác nhân và thời gian nằm trong cùng một dòng phụ, cho phép xuống dòng.
    const meta = screen.getByText("Trưởng garage").parentElement;
    expect(meta).toBe(screen.getByText("06/11/2026 13:39").parentElement);
    expect(container.querySelector(".whitespace-nowrap")).toBeNull();
  });

  it("layout mặc định inline vẫn đặt thời gian ở cột phải (không đổi hành vi cũ)", () => {
    const { container } = render(<DrawerAuditTimeline items={MOCK_ITEMS} />);
    expect(container.querySelector(".whitespace-nowrap")).not.toBeNull();
  });
});
