// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErpInvoiceAccountingSection } from "./ErpInvoiceAccountingSection";
import { buildDefaultAccountingLines } from "./ErpInvoiceAccountingSection.helper";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

vi.mock("@/shared/components/accounting/PostedAccountingSummary", () => ({
  PostedAccountingSummary: ({ isPosted, journalEntryId }: any) => (
    <div data-testid="mock-posted-summary">
      {isPosted ? `Posted-${journalEntryId}` : "Unposted"}
    </div>
  ),
}));

vi.mock("@/shared/components/accounting/PostingSection", () => ({
  PostingSection: ({ editMode, getDefaultLines }: any) => (
    <div data-testid="mock-posting-section">
      <span>{editMode ? "EditPosting" : "ViewPosting"}</span>
      <button
        data-testid="trigger-default-lines"
        onClick={() => getDefaultLines?.([])}
      >
        TriggerDefaultLines
      </button>
    </div>
  ),
}));

describe("ErpInvoiceAccountingSection.helper", () => {
  const accountOptions = [
    { value: "acc-642", label: "642 - Chi phí quản lý kinh doanh" },
    { value: "acc-632", label: "632 - Giá vốn hàng bán" },
    { value: "acc-133", label: "133 - Thuế GTGT được khấu trừ" },
    { value: "acc-331", label: "331 - Phải trả người bán" },
    { value: "acc-131", label: "131 - Phải thu khách hàng" },
    { value: "acc-511", label: "511 - Doanh thu bán hàng" },
    { value: "acc-3331", label: "3331 - Thuế GTGT phải nộp" },
  ];

  it("builds correct debit/credit lines for purchase invoice (direction IN)", () => {
    const lines = buildDefaultAccountingLines({
      detailInvoice: {
        id: "inv-1",
        invoiceNo: "INV-001",
        preVatAmount: 1000000,
        vatAmount: 100000,
        totalAmount: 1100000,
        sellerTaxCode: "0100109106",
        direction: "IN",
      } as any,
      direction: "IN",
      accountOptions,
    });

    expect(lines).toHaveLength(3);
    expect(lines[0].debit).toBe(1000000);
    expect(lines[0].credit).toBe(0);
    expect(lines[1].accountId).toBe("acc-133");
    expect(lines[1].debit).toBe(100000);
    expect(lines[2].accountId).toBe("acc-331");
    expect(lines[2].credit).toBe(1100000);
  });

  it("builds correct debit/credit lines for sales invoice (direction OUT)", () => {
    const lines = buildDefaultAccountingLines({
      detailInvoice: {
        id: "inv-2",
        invoiceNo: "INV-002",
        preVatAmount: 2000000,
        vatAmount: 200000,
        totalAmount: 2200000,
        direction: "OUT",
      } as any,
      direction: "OUT",
      accountOptions,
    });

    expect(lines).toHaveLength(3);
    expect(lines[0].accountId).toBe("acc-131");
    expect(lines[0].debit).toBe(2200000);
    expect(lines[1].accountId).toBe("acc-511");
    expect(lines[1].credit).toBe(2000000);
    expect(lines[2].accountId).toBe("acc-3331");
    expect(lines[2].credit).toBe(200000);
  });
});

describe("ErpInvoiceAccountingSection Component", () => {
  it("renders null if detailInvoice is null", () => {
    const { container } = render(
      <ErpInvoiceAccountingSection detailInvoice={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders unposted badge and view summary in view mode", () => {
    render(
      <ErpInvoiceAccountingSection
        detailInvoice={{ id: "inv-1", postingStatus: "UNPOSTED" } as any}
      />,
    );

    expect(screen.getByText("CHƯA HẠCH TOÁN")).toBeDefined();
    expect(screen.getByTestId("mock-posted-summary")).toBeDefined();
  });

  it("renders posted badge when invoice is posted", () => {
    render(
      <ErpInvoiceAccountingSection
        detailInvoice={
          {
            id: "inv-1",
            postingStatus: "POSTED",
            journalEntryId: "je-100",
          } as any
        }
      />,
    );

    expect(screen.getByText("✓ ĐÃ HẠCH TOÁN")).toBeDefined();
  });

  it("shows branch warning in editMode when no branch is selected", () => {
    render(
      <ErpInvoiceAccountingSection
        detailInvoice={{ id: "inv-1" } as any}
        editMode={true}
        postingState={{ reset: vi.fn() }}
        form={{ branchIds: [] } as any}
      />,
    );

    expect(
      screen.getByText(
        "Vui lòng chọn chi nhánh ở cột bên phải trước khi nhập hạch toán kế toán.",
      ),
    ).toBeDefined();
  });

  it("allows toggling accountingEnabled in editMode with branch selected", () => {
    const fieldSet = vi.fn();
    render(
      <ErpInvoiceAccountingSection
        detailInvoice={{ id: "inv-1" } as any}
        editMode={true}
        postingState={{ reset: vi.fn() }}
        form={{ branchIds: ["branch-1"], accountingEnabled: false } as any}
        fieldSet={fieldSet}
      />,
    );

    const toggleBtn = screen.getByText("Bật hạch toán");
    fireEvent.click(toggleBtn);
    expect(fieldSet).toHaveBeenCalledWith("accountingEnabled", true);
  });
});
