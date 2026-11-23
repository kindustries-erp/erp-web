import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../audit.locale";
import type { AuditLogRow } from "../api/dtos/audit-log.dto";
import { AuditLogDrawer } from "./AuditLogDrawer";

const row: AuditLogRow = {
  id: "1",
  requestId: "req-1",
  actorUserId: "u1",
  actorEmail: "admin@liouni.com",
  actorEmployeeId: null,
  actionType: "UPDATE",
  module: "users",
  entityType: "users_management",
  entityId: "e1",
  route: "/api/v2/users-management/e1",
  httpMethod: "PATCH",
  status: "SUCCESS",
  message: "Cập nhật tài khoản",
  uiScreen: null,
  uiAction: null,
  beforeSnapshot: { status: "ACTIVE" },
  afterSnapshot: { status: "INACTIVE" },
  errorSnapshot: null,
  ipAddress: "10.0.0.1",
  userAgent: null,
  createdAt: "2026-01-01T00:00:00Z",
};

describe("AuditLogDrawer", () => {
  it("render nhãn - giá trị, không có ô nhập và không có nút sửa", () => {
    render(<AuditLogDrawer open row={row} onClose={vi.fn()} />);
    expect(screen.getAllByText("admin@liouni.com").length).toBeGreaterThan(0);
    expect(screen.getByText("INACTIVE")).toBeTruthy();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByText("Chỉnh sửa")).toBeNull();
  });
});
