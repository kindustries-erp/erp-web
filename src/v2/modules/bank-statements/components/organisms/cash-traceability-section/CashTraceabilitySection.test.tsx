import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { removeInvoice, linkInvoice, listAccounts } = vi.hoisted(() => ({
  removeInvoice: vi.fn(),
  linkInvoice: vi.fn(),
  listAccounts: vi.fn(),
}));

vi.mock("../../../api/cashTransactionApi", () => ({
  cashTransactionApi: {
    removeInvoice,
    linkInvoice,
    getTraceabilityGraph: vi.fn(),
  },
}));
vi.mock("@/v2/modules/finance-invoice/api/financeInvoiceV2Api", () => ({
  financeInvoiceV2Api: { list: vi.fn().mockResolvedValue({ items: [] }) },
}));

// Sơ đồ thật cần canvas; ở đây chỉ kiểm tra các tay cầm được nối đúng
vi.mock("@/v2/shared/components/organisms/v2-document-traceability", () => ({
  V2DocumentTraceability: (props: {
    onAddLink: () => void;
    onUnlinkNode: (n: unknown) => void;
    onOpenDocument: (n: unknown) => void;
  }) => (
    <div>
      <button type="button" onClick={() => props.onAddLink()}>
        mock-add
      </button>
      <button
        type="button"
        onClick={() => props.onUnlinkNode({ id: "n1", docType: "INVOICE" })}
      >
        mock-unlink
      </button>
      <button
        type="button"
        onClick={() => props.onOpenDocument({ id: "i1", docType: "INVOICE" })}
      >
        mock-open
      </button>
    </div>
  ),
}));

import { CashTraceabilitySection } from "./CashTraceabilitySection";

const renderSection = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CashTraceabilitySection
        transactionId="t1"
        editMode
        direction="OUT"
        existingInvoiceIds={[]}
        maxAvailableAmount={500}
      />
    </QueryClientProvider>,
  );

describe("CashTraceabilitySection", () => {
  beforeEach(() => {
    removeInvoice.mockReset().mockResolvedValue({ message: "ok" });
    linkInvoice.mockReset();
    listAccounts.mockReset();
  });

  it("thêm liên kết mở modal cấn trừ hóa đơn", async () => {
    renderSection();
    fireEvent.click(screen.getByText("mock-add"));
    expect(await screen.findByText("Cấn trừ hóa đơn")).toBeTruthy();
  });

  it("gỡ liên kết gọi removeInvoice với id của nút", async () => {
    renderSection();
    fireEvent.click(screen.getByText("mock-unlink"));
    await waitFor(() => expect(removeInvoice).toHaveBeenCalledWith("t1", "n1"));
  });

  it("mở chứng từ phát sự kiện toàn cục đúng loại và id", () => {
    renderSection();
    const handler = vi.fn();
    window.addEventListener("open_erp_document", handler);
    fireEvent.click(screen.getByText("mock-open"));
    window.removeEventListener("open_erp_document", handler);
    expect(handler.mock.calls[0][0].detail).toEqual({
      type: "erp_invoice",
      id: "i1",
    });
  });
});
