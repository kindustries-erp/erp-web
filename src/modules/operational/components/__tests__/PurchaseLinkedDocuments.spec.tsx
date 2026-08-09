import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PurchaseLinkedDocuments } from "../PurchaseLinkedDocuments";

// Mock dependencies
vi.mock("@/modules/goods-receipts-core/api/goodsReceiptsCoreApi", () => ({
  goodsReceiptsCoreApi: {
    list: vi.fn().mockResolvedValue({
      items: [
        { id: "gr-1", receiptNo: "GR-001" },
        { id: "gr-2", receiptNo: "GR-002" },
      ],
    }),
  },
}));

vi.mock("@/modules/goods-receipts-core/hooks/useGrDrawer", () => ({
  useGrDrawer: vi.fn().mockReturnValue({
    open: false,
    openDetail: vi.fn(),
  }),
}));

vi.mock("@/modules/goods-receipts-core/components/GrFormDrawer", () => ({
  GrFormDrawer: () => <div data-testid="mock-gr-drawer" />,
}));

const mockReceipts = [
  {
    id: "r1",
    receiptNo: "RC-001",
    receiptDate: "2026-06-10T00:00:00Z",
    lines: [{ qtyReceived: "100" }, { qtyReceived: "50" }],
  },
];

describe("PurchaseLinkedDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state in view mode", () => {
    render(<PurchaseLinkedDocuments receipts={[]} editMode={false} />);
    expect(screen.getByText("CHỨNG TỪ LIÊN KẾT")).toBeInTheDocument();
    expect(
      screen.getByText("Chưa có chứng từ liên kết nào."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Thêm chứng từ")).not.toBeInTheDocument();
  });

  it("renders Add button in edit mode and shows table when clicked", async () => {
    render(<PurchaseLinkedDocuments receipts={[]} editMode={true} />);
    const addBtn = screen.getByText("Thêm chứng từ");
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(screen.getByText("Loại chứng từ")).toBeInTheDocument();
  });

  it("renders existing receipts correctly", () => {
    render(
      <PurchaseLinkedDocuments
        receipts={mockReceipts as any}
        editMode={false}
      />,
    );

    expect(screen.getByText("Phiếu nhập kho")).toBeInTheDocument();
    expect(screen.getByText("RC-001")).toBeInTheDocument();
    expect(screen.getByText(/150 SL/)).toBeInTheDocument(); // 100 + 50
  });

  it("does not render a remove button for GR rows in edit mode", () => {
    render(
      <PurchaseLinkedDocuments
        receipts={mockReceipts as any}
        editMode={true}
      />,
    );

    const removeBtns = screen
      .queryAllByRole("button")
      .filter((btn) => btn.className.includes("text-red-500"));
    expect(removeBtns).toHaveLength(0); // No delete buttons for GR
  });
});
