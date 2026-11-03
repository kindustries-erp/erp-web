import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseCombobox } from "./GarageCaseCombobox";
import { formatCaseToOption } from "./GarageCaseCombobox.helper";
import { garageApi } from "../../../api/garageApi";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: () => true,
}));

vi.mock("@/v2/shared/components/molecules/v2-combobox", () => ({
  V2Combobox: ({ placeholder, options, disabled, fallbackLabel }: any) => (
    <div
      data-testid="mock-combobox"
      data-disabled={disabled ? "true" : undefined}
      data-options-count={options?.length || 0}
      data-options-json={JSON.stringify(
        options?.map((o: any) => ({
          value: o.value,
          label: o.label,
          isTargetRelated: o.isTargetRelated,
        })),
      )}
    >
      <span>{fallbackLabel || placeholder}</span>
    </div>
  ),
}));

vi.mock("../../../api/garageApi", () => ({
  garageApi: {
    getCases: vi.fn(),
    getCasesByCustomer: vi.fn(),
    getCasesBySupplier: vi.fn(),
  },
}));

describe("GarageCaseCombobox & Helper", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("formats target-related case option with star prefix", () => {
    const rawCase = {
      id: "case-01",
      soChungTu: "SC-100",
      bienSoXe: "30A-99999",
      khachHangName: "Nguyen Van A",
      tienCoThue: 5000000,
      chiPhi: 2000000,
    };
    const option = formatCaseToOption(rawCase, true);
    expect(option.label).toContain("⭐ 30A-99999 - SC-100");
    expect(option.originalName).toBe("Nguyen Van A");
    expect(option.isTargetRelated).toBe(true);
  });

  it("strictly isolates cases and only shows target customer cases when customerCode is provided", async () => {
    vi.mocked(garageApi.getCasesByCustomer).mockResolvedValueOnce([
      {
        id: "case-cust-1",
        soChungTu: "SC-CUST",
        bienSoXe: "51S-28386",
        khachHangName: "NGUYỄN MINH ĐỨC",
      },
    ]);
    vi.mocked(garageApi.getCases).mockResolvedValue({
      data: [
        {
          id: "case-general-unrelated",
          soChungTu: "SC-GEN",
          bienSoXe: "50E-95703",
          khachHangName: "PHẠM VĂN TÂN",
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseCombobox
          customerCode="GR-KHA-000160"
          licensePlate="51S28386"
          placeholder="Chọn vụ việc..."
        />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const combobox = screen.getByTestId("mock-combobox");
      const count = Number(combobox.getAttribute("data-options-count"));
      expect(count).toBe(1);
    });

    const combobox = screen.getByTestId("mock-combobox");
    const jsonStr = combobox.getAttribute("data-options-json") || "[]";
    const options = JSON.parse(jsonStr);

    expect(options).toHaveLength(1);
    expect(options[0].value).toBe("case-cust-1");
    expect(options[0].isTargetRelated).toBe(true);
    // General cases MUST NOT be fetched or included!
    expect(garageApi.getCases).not.toHaveBeenCalled();
    expect(options.some((o: any) => o.value === "case-general-unrelated")).toBe(
      false,
    );
  });

  it("loads general cases when no customer or supplier context is provided", async () => {
    vi.mocked(garageApi.getCases).mockResolvedValueOnce({
      data: [
        {
          id: "case-gen-1",
          soChungTu: "SC-GEN",
          bienSoXe: "50E-95703",
          khachHangName: "PHẠM VĂN TÂN",
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseCombobox placeholder="Chọn vụ việc..." />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const combobox = screen.getByTestId("mock-combobox");
      const count = Number(combobox.getAttribute("data-options-count"));
      expect(count).toBe(1);
    });

    const combobox = screen.getByTestId("mock-combobox");
    const jsonStr = combobox.getAttribute("data-options-json") || "[]";
    const options = JSON.parse(jsonStr);

    expect(options).toHaveLength(1);
    expect(options[0].value).toBe("case-gen-1");
    expect(options[0].isTargetRelated).toBe(false);
    expect(garageApi.getCasesByCustomer).not.toHaveBeenCalled();
  });
});
