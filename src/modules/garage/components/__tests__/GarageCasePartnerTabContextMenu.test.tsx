import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCasePartnerTab } from "../GarageCasePartnerTab";
import { garageApi } from "../../api/garageApi";

// Mock garageApi
vi.mock("../../api/garageApi", () => ({
  garageApi: {
    getCasesByCustomer: vi.fn(),
  },
}));

// Capture rowHoverActions callback from DataTable
let capturedRowHoverActions: any = null;
vi.mock("@/shared/components/DataTable", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    DataTable: vi.fn((props: any) => {
      capturedRowHoverActions = props.rowHoverActions;
      return (
        <div data-testid="mock-data-table">
          DataTable Rows: {props.items?.length || 0}
        </div>
      );
    }),
  };
});

describe("GarageCasePartnerTab Context Menu (rowHoverActions)", () => {
  let queryClient: QueryClient;

  const mockCases = [
    {
      id: "case-1",
      soChungTu: "GR-PDV2609-0070",
      bienSoXe: "70A45967",
      ngayPhatSinh: "2026-09-28T17:04:00Z",
      tienCoThue: 3100680,
      tienDaThanhToan: 0,
      tienConPhaiThanhToan: 3100680,
      agingDays: 1,
      tenTinhTrangDichVu: "Kết thúc",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    capturedRowHoverActions = null;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (garageApi.getCasesByCustomer as any).mockResolvedValue(mockCases);
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof GarageCasePartnerTab>> = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GarageCasePartnerTab
          customerCode="CUST-001"
          customerName="Công ty TNHH Sailun Việt Nam"
          currentCaseCode="GR-PDV2609-0070"
          branchId="branch-dt"
          {...props}
        />
      </QueryClientProvider>,
    );
  };

  it("renders 2 context menu groups: TRA CỨU and THAO TÁC matching GarageCases.tsx", async () => {
    renderComponent();

    await waitFor(() => {
      expect(capturedRowHoverActions).toBeDefined();
    });

    const groups = capturedRowHoverActions(mockCases[0]);
    expect(groups).toHaveLength(2);

    // Group 1: TRA CỨU
    expect(groups[0].groupLabel).toBe("TRA CỨU");
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].items[0].label).toBe("Xem chi tiết");
    expect(groups[0].items[1].label).toBe("Chi tiết theo đối tượng");

    // Group 2: THAO TÁC
    expect(groups[1].groupLabel).toBe("THAO TÁC");
    expect(groups[1].items).toHaveLength(3);
    expect(groups[1].items[0].label).toBe("Chỉnh sửa");
    expect(groups[1].items[1].label).toBe("Phân loại");
    expect(groups[1].items[2].label).toBe("Đối soát");
  });

  it("triggers onSelectCase with correct options on each action", async () => {
    const onSelectCase = vi.fn();
    renderComponent({ onSelectCase });

    await waitFor(() => {
      expect(capturedRowHoverActions).toBeDefined();
    });

    const groups = capturedRowHoverActions(mockCases[0]);

    // 1. Xem chi tiết
    groups[0].items[0].onClick();
    expect(onSelectCase).toHaveBeenLastCalledWith("GR-PDV2609-0070", {
      tabKey: "quote_details",
      subTabKey: "details",
      editMode: false,
    });

    // 2. Chi tiết theo đối tượng
    groups[0].items[1].onClick();
    expect(onSelectCase).toHaveBeenLastCalledWith("GR-PDV2609-0070", {
      tabKey: "quote_details",
      subTabKey: "partner",
      editMode: false,
    });

    // 3. Chỉnh sửa
    groups[1].items[0].onClick();
    expect(onSelectCase).toHaveBeenLastCalledWith("GR-PDV2609-0070", {
      tabKey: "quote_details",
      subTabKey: "details",
      editMode: true,
    });

    // 4. Phân loại
    groups[1].items[1].onClick();
    expect(onSelectCase).toHaveBeenLastCalledWith("GR-PDV2609-0070", {
      tabKey: "quote_details",
      subTabKey: "details",
      editMode: true,
    });

    // 5. Đối soát
    groups[1].items[2].onClick();
    expect(onSelectCase).toHaveBeenLastCalledWith("GR-PDV2609-0070", {
      tabKey: "financials",
      editMode: false,
    });
  });
});
