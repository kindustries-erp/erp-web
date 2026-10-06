import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCases } from "../GarageCases";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

let tablePropsSpy: any = null;
let standaloneDrawerPropsSpy: any = null;

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

vi.mock("../../store/garageStore", () => ({
  useGarageStore: () => ({
    selectedBranchId: "branch-1",
    setSelectedBranchId: vi.fn(),
  }),
}));

vi.mock("../../hooks/useGarage", () => ({
  useGarageBranches: () => ({
    data: [{ externalId: "b-1", name: "Chi nhánh 1" }],
    isLoading: false,
  }),
}));

vi.mock("@/shared/hooks/usePageViewPresets", () => ({
  usePageViewPresets: () => ({
    presets: [],
    savePreset: vi.fn(),
    deletePreset: vi.fn(),
  }),
}));

vi.mock("../../components/organisms/garage-cases-table", () => ({
  GarageCasesTable: (props: any) => {
    tablePropsSpy = props;
    return <div data-testid="garage-cases-table" />;
  },
}));

vi.mock("../../components/GarageCaseStandaloneDrawer", () => ({
  GarageCaseStandaloneDrawer: (props: any) => {
    standaloneDrawerPropsSpy = props;
    return <div data-testid="garage-case-standalone-drawer" />;
  },
}));

vi.mock("../../components/GarageCaseSyncDrawer", () => ({
  GarageCaseSyncDrawer: () => null,
}));

vi.mock("../../components/GarageCaseViewConfigDrawer", () => ({
  GarageCaseViewConfigDrawer: () => null,
}));

vi.mock("../../components/GarageCaseExportDrawer", () => ({
  GarageCaseExportDrawer: () => null,
}));

describe("GarageCases Page - Edit Mode RBAC Triggers", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    tablePropsSpy = null;
    standaloneDrawerPropsSpy = null;
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("passes initialEditMode=true when user has GARAGE:update on financials and edit triggers", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (r, a) => r === ErpResource.GARAGE && a === ErpAction.UPDATE,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy).toBeDefined();

    // Trigger onOpenFinancials
    act(() => {
      tablePropsSpy.onOpenFinancials("CASE-001", true);
    });

    expect(standaloneDrawerPropsSpy.isOpen).toBe(true);
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(true);
    expect(standaloneDrawerPropsSpy.initialTabKey).toBe("financials");

    // Trigger onOpenEditNotes
    act(() => {
      tablePropsSpy.onOpenEditNotes({ soChungTu: "CASE-002" });
    });
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(true);

    // Trigger onOpenConfig
    act(() => {
      tablePropsSpy.onOpenConfig({ soChungTu: "CASE-003" });
    });
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(true);
  });

  it("forces initialEditMode=false when user lacks GARAGE:update", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCases />
      </QueryClientProvider>,
    );

    expect(tablePropsSpy).toBeDefined();

    // Trigger onOpenFinancials with editMode=true
    act(() => {
      tablePropsSpy.onOpenFinancials("CASE-001", true);
    });

    expect(standaloneDrawerPropsSpy.isOpen).toBe(true);
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(false);

    // Trigger onOpenEditNotes
    act(() => {
      tablePropsSpy.onOpenEditNotes({ soChungTu: "CASE-002" });
    });
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(false);

    // Trigger onOpenConfig
    act(() => {
      tablePropsSpy.onOpenConfig({ soChungTu: "CASE-003" });
    });
    expect(standaloneDrawerPropsSpy.initialEditMode).toBe(false);
  });
});
