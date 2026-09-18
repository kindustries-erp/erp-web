// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TraceabilityTableView } from "../TableView";
import type { TraceabilityGraphData } from "@/shared/types/traceability";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("TraceabilityTableView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGraphData: TraceabilityGraphData = {
    rootId: "root-1",
    rootType: "BANK_TXN",
    nodes: [
      {
        id: "root-1",
        docType: "BANK_TXN",
        docNo: "TXN-001",
        title: "Giao dịch gốc",
        date: "2026-09-12T00:00:00.000Z",
        amount: 5063580,
        netOffAmount: 5063580,
        isCurrent: true,
        depth: 0,
        hasPermission: true,
        restricted: false,
        requiredResource: "bank_statements",
      },
      {
        id: "inv-929",
        docType: "INVOICE",
        docNo: "929",
        title: "Hóa đơn bán hàng 929",
        partnerName: "CÔNG TY CỔ PHẦN THƯƠNG MẠI - KỸ THUẬT - XÂY DỰNG T.E.C",
        date: "2026-05-15T00:00:00.000Z",
        amount: 5063580,
        netOffAmount: 5063580,
        isCurrent: false,
        depth: 1,
        hasPermission: true,
        restricted: false,
        requiredResource: "invoices",
      },
      {
        id: "je-1",
        docType: "JOURNAL_ENTRY",
        docNo: "HD8-20260515-01",
        title: "Bút toán sổ cái (HD8-20260515-01)",
        partnerName: "Bút toán sổ cái (HD8-20260515-01)",
        date: "2026-05-15T00:00:00.000Z",
        amount: 5063580,
        netOffAmount: 0,
        isCurrent: false,
        depth: 2,
        hasPermission: true,
        restricted: false,
        requiredResource: "general_journal",
      },
      {
        id: "so-1",
        docType: "SALES_ORDER",
        docNo: "SO-202605-0013",
        title: "Đơn hàng SO",
        partnerName: "CÔNG TY CỔ PHẦN THƯƠNG MẠI - KỸ THUẬT - XÂY DỰNG T.E.C",
        date: "2026-05-13T00:00:00.000Z",
        amount: 4914000,
        netOffAmount: 0,
        isCurrent: false,
        depth: 2,
        hasPermission: true,
        restricted: false,
        requiredResource: "sales_orders",
      },
    ],
    edges: [],
    summary: {
      totalAmount: 15041160,
      totalNetOffAmount: 5063580,
      matchRatio: 33.66,
      directCount: 1,
      transitiveCount: 2,
    },
  };

  it("render 2 phân vùng bảng: Chứng từ trực tiếp (1-hop) và Chứng từ gián tiếp (Multi-hops)", () => {
    render(<TraceabilityTableView graphData={mockGraphData} />);

    expect(
      screen.getByText("Chứng từ liên kết trực tiếp (1-hop)"),
    ).toBeTruthy();
    expect(
      screen.getByText("Chứng từ liên kết trung gian / gián tiếp (Multi-hops)"),
    ).toBeTruthy();

    expect(screen.getByText("929")).toBeTruthy();
    expect(screen.getByText("HD8-20260515-01")).toBeTruthy();
    expect(screen.getByText("SO-202605-0013")).toBeTruthy();
  });

  it("hiển thị cột STT #, Loại, Ngày, Số chứng từ, Giá trị và Đã cấn trừ chuẩn xác, không có cột Thao tác tĩnh", () => {
    render(<TraceabilityTableView graphData={mockGraphData} />);

    const sttHeaders = screen.getAllByText("#");
    expect(sttHeaders.length).toBe(2);

    expect(screen.getAllByText("Loại").length).toBe(2);
    expect(screen.getAllByText("Ngày").length).toBe(2);
    expect(screen.getAllByText("Số chứng từ").length).toBe(2);
    expect(screen.getAllByText("Đối tác / Tiêu đề").length).toBe(2);
    expect(screen.getAllByText("Giá trị").length).toBe(2);
    expect(screen.getAllByText("Đã cấn trừ").length).toBe(2);
    expect(screen.queryByText("Thao tác")).toBeNull();
  });

  it("hiển thị dòng Tổng cộng (summaryRow) cho cả 2 bảng", () => {
    render(<TraceabilityTableView graphData={mockGraphData} />);

    const totalLabels = screen.getAllByText("Tổng cộng:");
    expect(totalLabels.length).toBe(2);
  });

  it("kích hoạt gỡ liên kết từ context menu khi allowEdit = true trên node trực tiếp", () => {
    const handleUnlink = vi.fn();
    render(
      <TraceabilityTableView
        graphData={mockGraphData}
        allowEdit={true}
        onUnlinkNode={handleUnlink}
      />,
    );

    const docCell = screen.getByText("929");
    const row = docCell.closest("tr");
    expect(row).toBeTruthy();

    fireEvent.contextMenu(row!);

    const unlinkMenu = screen.getByText("Gỡ liên kết");
    expect(unlinkMenu).toBeTruthy();
    fireEvent.click(unlinkMenu);

    expect(handleUnlink).toHaveBeenCalledWith(
      expect.objectContaining({ id: "inv-929" }),
    );
  });

  it("hiển thị empty state khi không có node trong phân vùng", () => {
    const emptyGraphData: TraceabilityGraphData = {
      rootId: "root-1",
      rootType: "BANK_TXN",
      nodes: [
        {
          id: "root-1",
          docType: "BANK_TXN",
          docNo: "TXN-001",
          title: "Root",
          date: null,
          isCurrent: true,
          depth: 0,
          hasPermission: true,
          restricted: false,
          requiredResource: "bank_statements",
        },
      ],
      edges: [],
      summary: {
        totalAmount: 0,
        totalNetOffAmount: 0,
        matchRatio: 0,
        directCount: 0,
        transitiveCount: 0,
      },
    };

    render(<TraceabilityTableView graphData={emptyGraphData} />);

    const emptyLabels = screen.getAllByText("Không có chứng từ liên kết");
    expect(emptyLabels.length).toBe(2);
  });
});
