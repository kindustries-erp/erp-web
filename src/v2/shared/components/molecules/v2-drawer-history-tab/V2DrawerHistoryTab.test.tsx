import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { V2DrawerHistoryTab } from "./V2DrawerHistoryTab";
import type { DrawerAuditItem } from "./V2DrawerHistoryTab.type";

const mockItems: DrawerAuditItem[] = [
  {
    id: "1",
    action: "Tạo mới vai trò",
    actor: "Admin",
    timestamp: "2026-01-01 10:00",
    details: "Khởi tạo vai trò Quản lý",
  },
];

describe("V2DrawerHistoryTab", () => {
  it("renders empty state when there are no items", () => {
    render(<V2DrawerHistoryTab items={[]} />);
    expect(screen.getByText("Chưa có bản ghi lịch sử nào")).toBeInTheDocument();
  });

  it("renders audit items when provided", () => {
    render(<V2DrawerHistoryTab items={mockItems} />);
    expect(screen.getByText("Tạo mới vai trò")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
