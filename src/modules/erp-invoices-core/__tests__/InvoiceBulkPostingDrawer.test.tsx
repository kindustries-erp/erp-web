// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InvoiceBulkPostingDrawer } from "../components/InvoiceBulkPostingDrawer";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({ data: [] }),
  useMutation: vi
    .fn()
    .mockImplementation(({ mutationFn, onSuccess, onError }: any) => ({
      mutate: () => {
        mutationFn().then(onSuccess).catch(onError);
      },
      isPending: false,
    })),
}));

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    postInvoice: vi.fn(),
    unpostInvoice: vi.fn(),
  },
}));

const mockOnClose = vi.fn();
const mockOnSuccess = vi.fn();

const mockInvoices: any[] = [
  {
    id: "inv-1",
    invoiceNo: "0000123",
    totalAmount: 1080000,
    vatAmount: 80000,
    vatRate: 8,
    postingStatus: "UNPOSTED",
    invoiceDate: "2026-07-01",
    branchId: "branch-1",
    lines: [],
  },
  {
    id: "inv-2",
    invoiceNo: "0000124",
    totalAmount: 2000000,
    vatAmount: 0,
    vatRate: 0,
    postingStatus: "UNPOSTED",
    invoiceDate: "2026-07-02",
    branchId: "branch-1",
    lines: [],
  },
];

describe("InvoiceBulkPostingDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hiển thị danh sách hóa đơn", () => {
    it("hiển thị thuế suất dạng (8%) bên cạnh tiền thuế", () => {
      render(
        <InvoiceBulkPostingDrawer
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          invoices={mockInvoices}
          selectedInvoiceIds={["inv-1"]}
          mode="post"
        />,
      );

      expect(screen.getByText(/80\.000.*\(8%\)/)).toBeInTheDocument();
    });

    it("không hiển thị (0%) khi vatRate = 0", () => {
      render(
        <InvoiceBulkPostingDrawer
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          invoices={mockInvoices}
          selectedInvoiceIds={["inv-2"]}
          mode="post"
        />,
      );

      const elements = screen.getAllByText(/0\s*₫/);
      expect(elements.length).toBeGreaterThan(0);
      expect(screen.queryByText("(0%)")).not.toBeInTheDocument();
    });
  });

  describe("validation hạch toán", () => {
    it("nút 'Thực hiện hạch toán' disabled khi cấu hình không hợp lệ", () => {
      render(
        <InvoiceBulkPostingDrawer
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          invoices={mockInvoices}
          selectedInvoiceIds={["inv-1"]}
          mode="post"
        />,
      );

      const button = screen.getByRole("button", {
        name: "Thực hiện hạch toán",
      });
      expect(button).toBeDisabled();
    });
  });

  describe("hủy hạch toán hàng loạt", () => {
    it("hiển thị nút 'Hủy hạch toán' khi mode='unpost'", () => {
      render(
        <InvoiceBulkPostingDrawer
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          invoices={[{ ...mockInvoices[0], postingStatus: "POSTED" }]}
          selectedInvoiceIds={["inv-1"]}
          mode="unpost"
        />,
      );

      expect(
        screen.getByRole("button", { name: "Hủy hạch toán" }),
      ).toBeInTheDocument();
    });

    it("gọi unpostInvoice cho từng invoice khi confirm hủy", async () => {
      (erpInvoicesCoreApi.unpostInvoice as any).mockResolvedValue({});

      render(
        <InvoiceBulkPostingDrawer
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          invoices={[{ ...mockInvoices[1], postingStatus: "POSTED" }]}
          selectedInvoiceIds={["inv-2"]}
          mode="unpost"
        />,
      );

      const button = screen.getByRole("button", { name: "Hủy hạch toán" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(erpInvoicesCoreApi.unpostInvoice).toHaveBeenCalledWith("inv-2");
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
