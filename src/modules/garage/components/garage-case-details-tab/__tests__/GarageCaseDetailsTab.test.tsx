import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseDetailsTab } from "../GarageCaseDetailsTab";
import { garageApi } from "../../../api/garageApi";

// Mock child components to keep unit test isolated according to /ui-atomic-refactor
vi.mock("../../GarageCasePreview", () => ({
  GarageCasePreview: vi.fn(({ caseData }: any) => (
    <div data-testid="garage-case-preview">
      Preview: {caseData?.soChungTu || "N/A"}
    </div>
  )),
}));

vi.mock("../../GarageCasePartnerTab", () => ({
  GarageCasePartnerTab: vi.fn(({ customerCode }: any) => (
    <div data-testid="garage-case-partner-tab">
      Partner Cases for: {customerCode || "N/A"}
    </div>
  )),
}));

vi.mock("../../../api/garageApi", () => ({
  garageApi: {
    getCasesByCustomer: vi.fn(),
  },
}));

describe("GarageCaseDetailsTab Component", () => {
  let queryClient: QueryClient;

  const mockCase = {
    id: "case-123",
    soChungTu: "GR-PDV2609-0070",
    khachHangCode: "CUST-001",
    khachHangName: "Công ty TNHH Sailun Việt Nam",
    branchExternalId: "branch-dt",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (garageApi.getCasesByCustomer as any).mockResolvedValue([
      { id: "case-1", soChungTu: "GR-PDV-01" },
      { id: "case-2", soChungTu: "GR-PDV-02" },
      { id: "case-3", soChungTu: "GR-PDV-03" },
    ]);
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof GarageCaseDetailsTab>> = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseDetailsTab selectedCase={mockCase} {...props} />
      </QueryClientProvider>,
    );
  };

  it("renders nothing when selectedCase is null or undefined", () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <GarageCaseDetailsTab selectedCase={null} />
      </QueryClientProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders both sub-tabs 'Chi tiết' and 'Chi tiết theo đối tượng'", async () => {
    renderComponent();

    expect(screen.getByText("Chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Chi tiết theo đối tượng")).toBeInTheDocument();
  });

  it("renders GarageCasePreview by default in 'details' mode", () => {
    renderComponent();

    expect(screen.getByTestId("garage-case-preview")).toBeInTheDocument();
    expect(screen.queryByTestId("garage-case-partner-tab")).toBeNull();
  });

  it("displays badge count on 'Chi tiết theo đối tượng' tab from query cache", async () => {
    renderComponent();

    await waitFor(() => {
      expect(garageApi.getCasesByCustomer).toHaveBeenCalledWith(
        "branch-dt",
        "CUST-001",
      );
    });

    // Badge count 3 should be displayed
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("switches to 'Chi tiết theo đối tượng' when clicked in uncontrolled mode", async () => {
    const onViewModeChange = vi.fn();
    renderComponent({ onViewModeChange });

    const partnerTabTrigger = screen.getByText("Chi tiết theo đối tượng");
    fireEvent.click(partnerTabTrigger);

    await waitFor(() => {
      expect(screen.getByTestId("garage-case-partner-tab")).toBeInTheDocument();
      expect(screen.queryByTestId("garage-case-preview")).toBeNull();
    });

    expect(onViewModeChange).toHaveBeenCalledWith("partner");
  });

  it("renders controlled viewMode correctly when viewMode='partner'", () => {
    renderComponent({ viewMode: "partner" });

    expect(screen.getByTestId("garage-case-partner-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("garage-case-preview")).toBeNull();
  });
});
