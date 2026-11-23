import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildRolesColumns } from "./RoleTable.columns";
import { rolesViewVisibility } from "./RoleTable.views";
import type { Role } from "../../../domain/entities/role";

const columns = buildRolesColumns(
  (_key, fallback) => fallback ?? "",
  () => undefined,
);

describe("buildRolesColumns", () => {
  it("leaves the row number to V2StandardTable", () => {
    expect(columns.map((column) => column.key)).not.toContain("index");
  });

  it("keeps every field as a column in the correct order", () => {
    expect(columns.map((column) => column.key)).toEqual([
      "name",
      "description",
      "users",
      "isSystem",
      "status",
      "createdAt",
    ]);
  });

  it("renders users column with V2Badge", () => {
    const usersCol = columns.find((c) => c.key === "users");
    expect(usersCol).toBeDefined();

    const mockRole: Role = {
      id: "r1",
      name: "Admin",
      isSystem: false,
      status: "ACTIVE",
      users: [
        { id: "u1", email: "admin@liouni.com" },
        { id: "u2", email: "user@liouni.com" },
      ],
    };

    render(<div>{usersCol?.cell?.(mockRole, 0)}</div>);
    expect(screen.getByText("admin@liouni.com")).toBeInTheDocument();
    expect(screen.getByText("user@liouni.com")).toBeInTheDocument();
  });

  it("renders isSystem column with RoleSystemBadge", () => {
    const systemCol = columns.find((c) => c.key === "isSystem");
    expect(systemCol).toBeDefined();

    const mockRoleCustom: Role = {
      id: "r1",
      name: "Custom Role",
      isSystem: false,
      status: "ACTIVE",
    };
    const { rerender } = render(
      <div>{systemCol?.cell?.(mockRoleCustom, 0)}</div>,
    );
    expect(screen.getByText("Tùy biến")).toBeInTheDocument();

    const mockRoleSystem: Role = {
      id: "r2",
      name: "System Role",
      isSystem: true,
      status: "ACTIVE",
    };
    rerender(<div>{systemCol?.cell?.(mockRoleSystem, 1)}</div>);
    expect(screen.getByText("Hệ thống")).toBeInTheDocument();
  });
});

describe("rolesViewVisibility", () => {
  it("shows all columns in the all view", () => {
    expect(Object.values(rolesViewVisibility.all).every(Boolean)).toBe(true);
  });
});
