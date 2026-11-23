import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCaseDetailsTab } from "../GarageCaseDetailsTab";
import { garageApi } from "../../../api/garageApi";

// Mock child components to keep unit test isolated according to /erp-ui-structure
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

  it("renders the 3 sub-tabs 'Chi tiết báo giá', 'Tài chính' and 'Chứng từ liên kết'", async () => {
    renderComponent();

    expect(screen.getByText("Chi tiết báo giá")).toBeInTheDocument();
    expect(screen.getByText("Tài chính")).toBeInTheDocument();
    expect(screen.getByText("Chứng từ liên kết")).toBeInTheDocument();
  });

  it("renders GarageCasePreview by default in 'details' mode", () => {
    renderComponent();

    expect(screen.getByTestId("garage-case-preview")).toBeInTheDocument();
  });

  it("displays badge counts on 'Tài chính' and 'Chứng từ liên kết' tabs", () => {
    renderComponent({
      financialsBadgeCount: 4,
      linkedDocsBadgeCount: 2,
    });

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("switches to 'Tài chính' when clicked in uncontrolled mode and renders financialsSlot", async () => {
    const onViewModeChange = vi.fn();
    renderComponent({
      onViewModeChange,
      financialsSlot: (
        <div data-testid="mock-financials-slot">Financials Slot</div>
      ),
    });

    const finTabTrigger = screen.getByText("Tài chính");
    fireEvent.click(finTabTrigger);

    await waitFor(() => {
      expect(screen.getByTestId("mock-financials-slot")).toBeInTheDocument();
      expect(screen.queryByTestId("garage-case-preview")).toBeNull();
    });

    expect(onViewModeChange).toHaveBeenCalledWith("financials");
  });

  it("switches to 'Chứng từ liên kết' when clicked and renders linkedDocsSlot", async () => {
    const onViewModeChange = vi.fn();
    renderComponent({
      onViewModeChange,
      linkedDocsSlot: (
        <div data-testid="mock-linked-docs-slot">Linked Docs Slot</div>
      ),
    });

    const linkTabTrigger = screen.getByText("Chứng từ liên kết");
    fireEvent.click(linkTabTrigger);

    await waitFor(() => {
      expect(screen.getByTestId("mock-linked-docs-slot")).toBeInTheDocument();
      expect(screen.queryByTestId("garage-case-preview")).toBeNull();
    });

    expect(onViewModeChange).toHaveBeenCalledWith("linked_docs");
  });

  it("renders controlled viewMode correctly when viewMode='partner'", () => {
    renderComponent({ viewMode: "partner" });

    expect(screen.getByTestId("garage-case-partner-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("garage-case-preview")).toBeNull();
  });
});
