import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2ActivityTimeline } from "./V2ActivityTimeline";
import { DrawerAuditTimeline } from "../v2-drawer-audit-timeline";
import type { V2ActivityItem } from "./V2ActivityTimeline.type";

const mockItems: V2ActivityItem[] = [
  {
    id: "act-1",
    action: "đã hủy",
    actor: "admin@liouni.com",
    timestamp: "2 phút trước",
    variant: "danger",
    badge: <span data-testid="badge-cancelled">Đã hủy</span>,
    subItems: [
      { key: "reason", label: "Lý do", value: "Test hủy đơn" },
      {
        key: "transition",
        label: "Chuyển trạng thái",
        value: "Đã duyệt ➔ Đã hủy",
      },
    ],
  },
  {
    id: "act-2",
    action: "đã duyệt",
    actor: "ai-test-duyet@example.com",
    timestamp: "3 giờ trước",
    variant: "success",
    badge: <span data-testid="badge-approved">Đã duyệt</span>,
  },
  {
    id: "act-3",
    action: "đã gửi duyệt",
    actor: "ai-test-tao@example.com",
    timestamp: "1 ngày trước",
    variant: "warning",
    badge: <span data-testid="badge-pending">Chờ duyệt</span>,
  },
];

describe("V2ActivityTimeline", () => {
  it("hiển thị thông báo khi không có sự kiện", () => {
    render(<V2ActivityTimeline items={[]} emptyMessage="Chưa có dữ liệu" />);
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("toàn bộ sự kiện được render đồng nhất dưới dạng thẻ V2ActivityCard", () => {
    render(<V2ActivityTimeline items={mockItems} />);
    const cards = screen.getAllByTestId("v2-activity-card");
    expect(cards).toHaveLength(3);

    // Card 1: Sự kiện đã hủy
    expect(cards[0]).toHaveTextContent("admin@liouni.com");
    expect(cards[0]).toHaveTextContent("đã hủy");
    expect(cards[0]).toHaveTextContent("2 phút trước");
    expect(screen.getByTestId("badge-cancelled")).toBeInTheDocument();
    expect(cards[0]).toHaveTextContent("Lý do: Test hủy đơn");
    expect(cards[0]).toHaveTextContent("Chuyển trạng thái: Đã duyệt ➔ Đã hủy");

    // Card 2: Sự kiện đã duyệt
    expect(cards[1]).toHaveTextContent("ai-test-duyet@example.com");
    expect(cards[1]).toHaveTextContent("đã duyệt");
    expect(cards[1]).toHaveTextContent("3 giờ trước");
    expect(screen.getByTestId("badge-approved")).toBeInTheDocument();

    // Card 3: Sự kiện gửi duyệt
    expect(cards[2]).toHaveTextContent("ai-test-tao@example.com");
    expect(cards[2]).toHaveTextContent("đã gửi duyệt");
    expect(cards[2]).toHaveTextContent("1 ngày trước");
  });

  it("DrawerAuditTimeline chuyển hướng thành công khi truyền layout='activity'", () => {
    render(<DrawerAuditTimeline items={mockItems as any} layout="activity" />);
    expect(screen.getByTestId("v2-activity-timeline")).toBeInTheDocument();
    const cards = screen.getAllByTestId("v2-activity-card");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("admin@liouni.com");
  });

  it("phân cấp 2 hàng: badge status nằm kế icon ở hàng 1, user email/name căn lề trái ở hàng 2", () => {
    render(<V2ActivityTimeline items={mockItems} />);
    const cards = screen.getAllByTestId("v2-activity-card");
    const badge = screen.getByTestId("badge-cancelled");

    // Badge nằm trong vùng header dòng 1 cùng cấp với icon
    expect(badge.closest(".flex.items-center.gap-2")).toBeInTheDocument();

    // Hàng 2 chứa actor và action căn lề trái (không bị thụt lề pl-6)
    const row2 = cards[0].querySelector(".mt-1\\.5.flex");
    expect(row2).toBeInTheDocument();
    expect(row2).not.toHaveClass("pl-6");
    expect(row2).toHaveTextContent("admin@liouni.com");
    expect(row2).toHaveTextContent("đã hủy");
  });

  it("chuẩn hóa divider: dot đầu tiên bắt đầu từ đỉnh (top-2), dot cuối cùng dừng chính xác tại tâm (h-2) không bị lố ra", () => {
    render(<V2ActivityTimeline items={mockItems} />);
    const cards = screen.getAllByTestId("v2-activity-card");
    const firstCard = cards[0]; // Có 2 subItems (reason & transition)

    const subItemRows = firstCard.querySelectorAll(
      ".relative.flex.items-center.min-w-0.py-0\\.5.pl-5",
    );
    expect(subItemRows).toHaveLength(2);

    // Item 1 (đầu tiên): divider bắt đầu từ top-2 kéo xuống bottom-0
    const firstDivider = subItemRows[0].querySelector("span.bg-zinc-300");
    expect(firstDivider).toHaveClass("top-2");
    expect(firstDivider).toHaveClass("bottom-0");

    // Item 2 (cuối cùng): divider từ top-0 và dừng tại h-2 (ngay tâm dot, không lố ra dưới)
    const lastDivider = subItemRows[1].querySelector("span.bg-zinc-300");
    expect(lastDivider).toHaveClass("top-0");
    expect(lastDivider).toHaveClass("h-2");
    expect(lastDivider).not.toHaveClass("bottom-0");
  });
});
