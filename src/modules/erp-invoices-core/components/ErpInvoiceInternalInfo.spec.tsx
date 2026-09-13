import { render, screen, waitFor } from "@testing-library/react";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "./ErpInvoiceInternalInfo";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    getPdfDownloadUrl: vi.fn().mockResolvedValue({ url: "blob:mock-url" }),
    setValid: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("@/modules/branches/api/branchApi", () => ({
  getBranchOptionsApi: vi.fn().mockResolvedValue([
    { value: "branch-1", label: "Chi nhánh Hà Nội" },
    { value: "branch-2", label: "Chi nhánh HCM" },
  ]),
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getGlobalAttributeDefs: vi.fn().mockResolvedValue([
      {
        id: "def-type-in",
        code: "type_invoice_in",
        name: "Phân loại hóa đơn mua vào",
        isGlobal: true,
        isSystem: true,
        fieldType: "SELECT",
        options: [
          { value: "PURCHASE_GOODS", label: "Mua hàng hóa / NVL" },
          { value: "EXPENSE_OPEX", label: "Chi phí OPEX" },
        ],
      },
    ]),
    getCategories: vi.fn().mockResolvedValue([]),
    getEntityValues: vi
      .fn()
      .mockResolvedValue({ attributes: {}, globalAttributes: {} }),
  },
  resolveOptionLabel: (opt: any) => opt.label || opt.value,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("./ErpInvoiceLinkedDocuments", () => ({
  ErpInvoiceLinkedDocuments: () => <div data-testid="mock-linked-docs" />,
}));

vi.mock("@/modules/tags/components/EntityTagSelector", () => ({
  EntityTagSelector: () => <div data-testid="mock-tag-selector" />,
}));

vi.mock("@/shared/components/ModuleEntityCustomFieldsSection", () => ({
  ModuleEntityCustomFieldsSection: ({
    globalTitle,
  }: {
    globalTitle?: string;
  }) => (
    <div data-testid="mock-custom-fields-section">
      <span>{globalTitle}</span>
    </div>
  ),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("ErpInvoiceInternalMain", () => {
  const defaultProps = {
    form: { invoiceNo: "INV-1" } as any,
    editMode: false,
    fieldSet: vi.fn(),
    direction: "IN" as const,
    detailInvoice: {
      id: "inv-1",
      postingStatus: "DRAFT",
      pdfFileKey: null,
      attachments: [],
    } as any,
    postingState: { lines: [], reset: vi.fn() },
    pendingUnpost: false,
    invoicePreview: <div data-testid="fallback-preview">Fallback Preview</div>,
  };

  it("should render fallback invoicePreview when there is no pdfKey", () => {
    render(<ErpInvoiceInternalMain {...defaultProps} />);
    expect(screen.getByTestId("fallback-preview")).toBeInTheDocument();
    expect(screen.queryByTitle("PDF Preview")).not.toBeInTheDocument();
  });

  it("should render iframe when pdfKey exists", async () => {
    const propsWithPdf = {
      ...defaultProps,
      detailInvoice: {
        ...defaultProps.detailInvoice,
        pdfFileKey: "some-pdf.pdf",
      },
    };

    render(<ErpInvoiceInternalMain {...propsWithPdf} />);

    await waitFor(() => {
      expect(screen.getByTitle("PDF Preview")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("fallback-preview")).not.toBeInTheDocument();
  });
});

describe("ErpInvoiceInternalSidebar", () => {
  const defaultSidebarProps = {
    form: {
      invoiceNo: "INV-001",
      branchId: "branch-1",
      notes: "Ghi chú kiểm tra",
      direction: "IN",
      globalAttributes: {
        type_invoice_in: "PURCHASE_GOODS",
      },
    } as any,
    editMode: false,
    fieldSet: vi.fn(),
    invoiceId: "inv-1",
    direction: "IN" as const,
    detailInvoice: {
      id: "inv-1",
      invoiceNo: "INV-001",
      branchId: "branch-1",
      notes: "Ghi chú kiểm tra",
      direction: "IN",
      isValid: true,
      validatedAt: new Date("2026-09-01"),
    } as any,
  };

  it("should render 3 distinct sections: THÔNG TIN CHUNG, THUỘC TÍNH MẶC ĐỊNH, and THUỘC TÍNH TÙY CHỈNH", async () => {
    renderWithQuery(<ErpInvoiceInternalSidebar {...defaultSidebarProps} />);

    await waitFor(() => {
      expect(screen.getByText("THÔNG TIN CHUNG")).toBeInTheDocument();
    });

    // Section 1: THÔNG TIN CHUNG
    expect(screen.getByText("Ghi chú")).toBeInTheDocument();
    expect(screen.getByText("Thẻ nhãn")).toBeInTheDocument();

    // Section 2: THUỘC TÍNH MẶC ĐỊNH
    expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    expect(screen.getByText("Phân loại hóa đơn mua vào")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn hợp lý, hợp lệ")).toBeInTheDocument();
    expect(screen.getAllByText("Mặc định").length).toBeGreaterThanOrEqual(2); // Badges for invoiceType & isValid

    // Section 3: THUỘC TÍNH TÙY CHỈNH
    expect(
      screen.getByTestId("mock-custom-fields-section"),
    ).toBeInTheDocument();
    expect(screen.getByText("THUỘC TÍNH TÙY CHỈNH")).toBeInTheDocument();
  });

  it("should render editable combobox for default attributes in editMode", async () => {
    const fieldSetMock = vi.fn();
    renderWithQuery(
      <ErpInvoiceInternalSidebar
        {...defaultSidebarProps}
        editMode={true}
        fieldSet={fieldSetMock}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    });
    expect(screen.getByText("Phân loại hóa đơn mua vào")).toBeInTheDocument();
  });

  it("should render default attributes and isValid badge for OUT direction (Hóa đơn bán ra)", async () => {
    const outProps = {
      ...defaultSidebarProps,
      direction: "OUT" as const,
      form: {
        ...defaultSidebarProps.form,
        direction: "OUT",
        globalAttributes: {
          type_invoice_out: "SALE_GOODS",
        },
      },
      detailInvoice: {
        ...defaultSidebarProps.detailInvoice,
        direction: "OUT",
      },
    };

    renderWithQuery(<ErpInvoiceInternalSidebar {...outProps} />);

    await waitFor(() => {
      expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    });

    expect(screen.getByText("Phân loại hóa đơn bán ra")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn hợp lý, hợp lệ")).toBeInTheDocument();
    expect(screen.getAllByText("Mặc định").length).toBeGreaterThanOrEqual(2);
  });
});
