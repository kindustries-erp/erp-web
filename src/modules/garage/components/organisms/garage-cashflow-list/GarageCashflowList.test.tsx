import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowList } from "./GarageCashflowList";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

let tablePropsSpy: any = null;
vi.mock("../garage-cashflow-table/GarageCashflowTable", () => ({
  GarageCashflowTable: (props: any) => {
    tablePropsSpy = props;
    return <div data-testid="garage-cashflow-table" />;
  },
}));

vi.mock("../garage-cashflow-drawer/GarageCashflowDrawer", () => ({
  GarageCashflowDrawer: () => <div data-testid="garage-cashflow-drawer" />,
}));

let caseDrawerPropsSpy: any = null;
vi.mock("../../GarageCaseStandaloneDrawer", () => ({
  GarageCaseStandaloneDrawer: (props: any) => {
    caseDrawerPropsSpy = props;
    return <div data-testid="garage-case-standalone-drawer" />;
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("GarageCashflowList Organism RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablePropsSpy = null;
    caseDrawerPropsSpy = null;
  });

  it("passes onCreate, onEdit, onDelete when user has full permissions", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowList />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy.onCreate).toBeDefined();
    expect(tablePropsSpy.onEdit).toBeDefined();
    expect(tablePropsSpy.onDelete).toBeDefined();
    expect(tablePropsSpy.canDelete).toBe(true);
  });

  it("sets onCreate to undefined when user lacks GARAGE_CASHFLOW:CREATE", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (res: string, action?: string) => {
        if (
          res === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.CREATE
        ) {
          return false;
        }
        return true;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowList />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy.onCreate).toBeUndefined();
    expect(tablePropsSpy.onEdit).toBeDefined();
    expect(tablePropsSpy.onDelete).toBeDefined();
  });

  it("sets onEdit to undefined when user lacks GARAGE_CASHFLOW:UPDATE", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (res: string, action?: string) => {
        if (
          res === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.UPDATE
        ) {
          return false;
        }
        return true;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowList />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy.onCreate).toBeDefined();
    expect(tablePropsSpy.onEdit).toBeUndefined();
    expect(tablePropsSpy.onDelete).toBeDefined();
  });

  it("sets onDelete to undefined when user lacks GARAGE_CASHFLOW:DELETE", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (res: string, action?: string) => {
        if (
          res === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.DELETE
        ) {
          return false;
        }
        return true;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowList />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy.onCreate).toBeDefined();
    expect(tablePropsSpy.onEdit).toBeDefined();
    expect(tablePropsSpy.onDelete).toBeUndefined();
    expect(tablePropsSpy.canDelete).toBe(false);
  });

  it("opens GarageCaseStandaloneDrawer when onOpenCaseDetail is called", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCashflowList />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy.onOpenCaseDetail).toBeDefined();
    expect(caseDrawerPropsSpy.isOpen).toBe(false);

    act(() => {
      tablePropsSpy.onOpenCaseDetail("GR-202610-0012");
    });

    expect(caseDrawerPropsSpy.isOpen).toBe(true);
    expect(caseDrawerPropsSpy.caseCode).toBe("GR-202610-0012");
  });
});
