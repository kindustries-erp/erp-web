import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { GarageCaseSyncDrawer } from "./GarageCaseSyncDrawer";

const startBulkSync = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def?: string) => def || _key,
  }),
}));

vi.mock("../../../hooks/useGarageBulkSync", () => ({
  useStartGarageBulkSync: () => ({
    mutateAsync: startBulkSync,
    isPending: false,
  }),
  useGarageBulkSyncStatus: () => ({
    data: undefined,
  }),
}));

vi.mock("../../../hooks/useGarage", () => ({
  useGarageBranches: () => ({
    data: [],
  }),
}));

describe("GarageCaseSyncDrawer Organism", () => {
  it("renders with default all-in-one mode", () => {
    render(<GarageCaseSyncDrawer open={true} onClose={vi.fn()} mode="all" />);
    expect(screen.getByText("Đồng bộ dữ liệu Garage")).toBeDefined();
    expect(
      screen.getByText("Bao gồm tải chi tiết vật tư phụ tùng & nhân công"),
    ).toBeDefined();
    expect(screen.getByText("Bắt đầu đồng bộ")).toBeDefined();
  });

  it("no longer asks for a branch", () => {
    render(<GarageCaseSyncDrawer open={true} onClose={vi.fn()} mode="all" />);
    expect(screen.queryByText("Branch:")).toBeNull();
    expect(
      screen.queryByRole("checkbox", { name: /Đồng bộ tất cả chi nhánh/ }),
    ).toBeNull();
  });

  it("hides the detail options outside all mode", () => {
    render(
      <GarageCaseSyncDrawer
        open={true}
        onClose={vi.fn()}
        mode="case-details"
      />,
    );
    expect(
      screen.queryByText("Bao gồm tải chi tiết vật tư phụ tùng & nhân công"),
    ).toBeNull();
  });

  it("starts one background job for the current mode when clicked", () => {
    startBulkSync.mockClear();
    render(<GarageCaseSyncDrawer open={true} onClose={vi.fn()} mode="cases" />);

    fireEvent.click(screen.getByText("Bắt đầu đồng bộ"));

    expect(startBulkSync).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "cases", includeDetails: undefined }),
    );
  });
});
