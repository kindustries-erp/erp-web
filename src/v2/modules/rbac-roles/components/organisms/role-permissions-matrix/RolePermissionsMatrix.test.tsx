import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RolePermissionsMatrix } from "./RolePermissionsMatrix";
import type {
  PermissionMap,
  ResourceItem,
} from "../../../domain/entities/permission";

const mockResources: ResourceItem[] = [
  { resource: "sales_orders", label: "Đơn bán hàng" },
  { resource: "purchase_orders", label: "Đơn mua hàng" },
];

const mockPermMap: PermissionMap = {
  sales_orders: { create: true, read: true, update: false, delete: false },
  purchase_orders: { create: false, read: true, update: false, delete: false },
};

describe("RolePermissionsMatrix", () => {
  it("renders loading skeleton when loading is true", () => {
    render(
      <RolePermissionsMatrix
        permMap={{}}
        setPermMap={vi.fn()}
        resources={[]}
        loading={true}
        error={null}
        isView={false}
        t={(_k, fb) => fb ?? ""}
      />,
    );
    expect(
      screen.getByText("Ma trận phân quyền & chức năng"),
    ).toBeInTheDocument();
  });

  it("renders matrix with resources and granted count badge", () => {
    render(
      <RolePermissionsMatrix
        permMap={mockPermMap}
        setPermMap={vi.fn()}
        resources={mockResources}
        loading={false}
        error={null}
        isView={false}
        t={(_k, fb) => fb ?? ""}
      />,
    );
    expect(screen.getByText("Đơn bán hàng")).toBeInTheDocument();
    expect(screen.getByText("Đơn mua hàng")).toBeInTheDocument();
    expect(screen.getByText("3 quyền được cấp")).toBeInTheDocument();
  });

  it("shows empty state when resources are empty and not loading", () => {
    render(
      <RolePermissionsMatrix
        permMap={{}}
        setPermMap={vi.fn()}
        resources={[]}
        loading={false}
        error={null}
        isView={false}
        t={(_k, fb) => fb ?? ""}
      />,
    );
    expect(
      screen.getByText("Chưa có danh sách tài nguyên"),
    ).toBeInTheDocument();
  });
});
