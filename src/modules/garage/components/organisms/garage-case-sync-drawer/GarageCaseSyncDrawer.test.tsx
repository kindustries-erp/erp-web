import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { GarageCaseSyncDrawer } from "./GarageCaseSyncDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def?: string) => def || _key,
  }),
}));

vi.mock("../../GarageBranchSelector", () => ({
  GarageBranchSelector: () => <div data-testid="branch-selector" />,
}));

vi.mock("../../../store/garageStore", () => ({
  useGarageStore: () => ({
    selectedBranchId: "branch-1",
  }),
}));

vi.mock("../../../hooks/useGarage", () => ({
  useSyncGarageAll: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSyncGarageCases: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSyncGarageGrossProfit: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSyncGarageCaseDetails: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
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
});
