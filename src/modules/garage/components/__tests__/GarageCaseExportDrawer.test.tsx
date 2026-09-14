import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { GarageCaseExportDrawer } from "../GarageCaseExportDrawer";
import { garageApi } from "@/modules/garage/api/garageApi";

const standardTableSpy = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));

vi.mock("@/modules/garage/hooks/useGarage", () => ({
  useGarageBranches: () => ({
    data: [
      { id: "b-1", externalId: "CN-01", name: "Chi nhánh Quận 7", code: "Q7" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ leftPanel, rightPanel }: any) => (
    <div data-testid="drawer-content">
      {leftPanel}
      {rightPanel}
    </div>
  ),
}));

vi.mock("@/shared/components/StandardTable", () => ({
  StandardTable: (props: any) => {
    standardTableSpy(props);
    return (
      <div data-testid="history-table">
        <div data-testid="history-table-count">{props.items?.length || 0}</div>
      </div>
    );
  },
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, placeholder, options }: any) => (
    <div data-testid="combobox">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={placeholder}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="datepicker"
      placeholder={placeholder}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("@/modules/garage/api/garageApi", () => ({
  garageApi: {
    exportCompletedCasesExcel: vi.fn().mockResolvedValue("Bang_ke_test.xlsx"),
  },
}));

describe("GarageCaseExportDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders export drawer layout with history section and filters", () => {
    render(
      <GarageCaseExportDrawer
        open={true}
        onClose={vi.fn()}
        initialBranchId="CN-01"
      />,
    );

    expect(screen.getByTestId("drawer-content")).toBeDefined();
    expect(screen.getByTestId("history-table")).toBeDefined();
    expect(screen.getByText("Xuất Excel")).toBeDefined();
  });

  it("triggers garageApi.exportCompletedCasesExcel when clicking start export", async () => {
    render(
      <GarageCaseExportDrawer
        open={true}
        onClose={vi.fn()}
        initialBranchId="CN-01"
      />,
    );

    const exportBtn = screen.getByText("Xuất Excel");
    await act(async () => {
      fireEvent.click(exportBtn);
    });

    expect(garageApi.exportCompletedCasesExcel).toHaveBeenCalled();
  });
});
