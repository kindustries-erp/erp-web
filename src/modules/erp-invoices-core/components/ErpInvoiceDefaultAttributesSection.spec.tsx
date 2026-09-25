import { render, screen, waitFor } from "@testing-library/react";
import { ErpInvoiceDefaultAttributesSection } from "./ErpInvoiceDefaultAttributesSection";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

vi.mock("../api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    setValid: vi.fn().mockResolvedValue({ success: true }),
    setCategory: vi.fn().mockResolvedValue({ success: true }),
    aiClassifyAndAutoPost: vi.fn().mockResolvedValue({
      categoryCode: "VF_PARTS",
      confidence: 0.95,
      isFallback: false,
    }),
  },
}));

vi.mock("@/core/api/moduleConfigApi", () => ({
  moduleConfigApi: {
    getCategories: vi.fn().mockResolvedValue([
      {
        id: "cat-1",
        code: "VF_PARTS",
        name: "Phụ tùng chính hãng VinFast",
      },
      {
        id: "cat-2",
        code: "OEM_OTHER_PARTS",
        name: "Phụ tùng OEM & Hãng khác",
      },
    ]),
    getGlobalAttributeDefs: vi.fn().mockResolvedValue([
      {
        id: "def-sub",
        code: "subcategory",
        name: "Phân loại chi tiết hóa đơn mua vào",
        isGlobal: true,
        isSystem: true,
        fieldType: "SELECT",
        options: [
          {
            value: "PUR_GOODS",
            label: "Hàng hóa / Phụ tùng",
          },
        ],
      },
    ]),
  },
  resolveOptionLabel: (opt: any) => opt.label || opt.value,
  resolveAttrName: (def: any) => def.name || def.code,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, params?: any) => {
      if (params?.categoryLabel) {
        return (fallback || key).replace(
          "{{categoryLabel}}",
          params.categoryLabel,
        );
      }
      return fallback || key;
    },
  }),
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

describe("ErpInvoiceDefaultAttributesSection", () => {
  const baseProps = {
    form: {
      invoiceNo: "INV-001",
      direction: "IN",
      categoryId: "cat-1",
      globalAttributes: {
        subcategory: "PUR_GOODS",
      },
    } as any,
    editMode: false,
    fieldSet: vi.fn(),
    direction: "IN" as const,
    detailInvoice: {
      id: "inv-1",
      invoiceNo: "INV-001",
      categoryId: "cat-1",
      category: {
        id: "cat-1",
        code: "VF_PARTS",
        name: "Phụ tùng chính hãng VinFast",
      },
      isValid: true,
      validatedAt: new Date("2026-09-01"),
    } as any,
    onRefreshDetail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render view labels correctly in view mode", async () => {
    renderWithQuery(<ErpInvoiceDefaultAttributesSection {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    });

    expect(screen.getByText("Phân loại hóa đơn mua vào")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText("Phân loại chi tiết hóa đơn mua vào"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Đã kiểm duyệt")).toBeInTheDocument();
  });

  it("should render comboboxes and allow changing subcategory in edit mode", async () => {
    const fieldSetMock = vi.fn();
    renderWithQuery(
      <ErpInvoiceDefaultAttributesSection
        {...baseProps}
        editMode={true}
        fieldSet={fieldSetMock}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    });

    expect(screen.getByText("Phân loại hóa đơn mua vào")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText("Phân loại chi tiết hóa đơn mua vào"),
      ).toBeInTheDocument();
    });
  });

  it("should render AI auto classify button for IN direction", async () => {
    renderWithQuery(<ErpInvoiceDefaultAttributesSection {...baseProps} />);

    await waitFor(() => {
      expect(screen.getByText("THUỘC TÍNH MẶC ĐỊNH")).toBeInTheDocument();
    });

    expect(screen.getByText("AI Phân loại")).toBeInTheDocument();
  });
});
