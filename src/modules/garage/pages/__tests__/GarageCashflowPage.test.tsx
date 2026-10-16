import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowPage } from "../GarageCashflowPage";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/pages/Forbidden", () => ({
  Forbidden: () => <div data-testid="forbidden-page">Access Denied</div>,
}));

vi.mock("../../components/organisms/garage-cashflow-list", () => ({
  GarageCashflowList: (props: any) => (
    <div data-testid="garage-cashflow-list" data-props={JSON.stringify(props)}>
      Garage Cashflow List Content
    </div>
  ),
}));

describe("GarageCashflowPage RBAC Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Forbidden when user lacks GARAGE_CASHFLOW:READ permission", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    render(<GarageCashflowPage />);

    expect(screen.getByTestId("forbidden-page")).toBeInTheDocument();
    expect(
      screen.queryByTestId("garage-cashflow-list"),
    ).not.toBeInTheDocument();
    expect(useHasPermission).toHaveBeenCalledWith(
      ErpResource.GARAGE_CASHFLOW,
      ErpAction.READ,
    );
  });

  it("renders GarageCashflowList when user has GARAGE_CASHFLOW:READ permission", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (resource: string, action?: string) => {
        return (
          resource === ErpResource.GARAGE_CASHFLOW && action === ErpAction.READ
        );
      },
    );

    const mockOpenCaseDetail = vi.fn();
    render(<GarageCashflowPage onOpenCaseDetail={mockOpenCaseDetail} />);

    expect(screen.queryByTestId("forbidden-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("garage-cashflow-list")).toBeInTheDocument();
  });
});
