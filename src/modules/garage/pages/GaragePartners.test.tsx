import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GaragePartners } from "./GaragePartners";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpAction, ErpResource } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/pages/Forbidden", () => ({
  Forbidden: () => <div data-testid="forbidden-page">403 Forbidden</div>,
}));

vi.mock("./GarageDebts", () => ({
  GarageDebts: () => <div data-testid="garage-debts-page">Debts</div>,
}));

describe("GaragePartners debts page gate", () => {
  it("renders Forbidden without GARAGE_DEBTS:READ", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    render(<GaragePartners />);

    expect(screen.getByTestId("forbidden-page")).toBeInTheDocument();
    expect(useHasPermission).toHaveBeenCalledWith(
      ErpResource.GARAGE_DEBTS,
      ErpAction.READ,
    );
  });

  it("renders debts page with GARAGE_DEBTS:READ", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(<GaragePartners />);

    expect(screen.getByTestId("garage-debts-page")).toBeInTheDocument();
  });
});
