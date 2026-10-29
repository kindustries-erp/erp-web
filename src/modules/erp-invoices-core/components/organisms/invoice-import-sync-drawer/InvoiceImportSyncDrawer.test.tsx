import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoiceImportSyncDrawer } from "./InvoiceImportSyncDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: unknown) =>
      typeof fallback === "string"
        ? fallback
        : (fallback as { defaultValue: string }).defaultValue,
  }),
  Trans: ({ children }: { children?: unknown }) => children,
}));

const handleSync = vi.fn();
const handleBulkXml = vi.fn();
const requestClose = vi.fn();

function makeState(overrides: Record<string, unknown> = {}) {
  return {
    method: "GDT",
    direction: "IN",
    period: {
      unit: "month",
      handleUnitChange: vi.fn(),
      period: "2026-10",
      handlePeriodChange: vi.fn(),
      periodOptions: [],
      dateFrom: "2026-10-01",
      setDateFrom: vi.fn(),
      dateTo: "2026-10-31",
      setDateTo: vi.fn(),
      reset: vi.fn(),
    },
    progress: { status: "idle", progress: 0, logs: [], currentItem: undefined },
    bulkXmlLoading: false,
    showPreview: false,
    setShowPreview: vi.fn(),
    viewInvoiceId: null,
    setViewInvoiceId: vi.fn(),
    showDrawerConfirm: false,
    setShowDrawerConfirm: vi.fn(),
    hasPendingXml: false,
    canEditInvoice: true,
    xml: {
      step: "select",
      files: [],
      result: null,
      direction: "IN",
      setDirection: vi.fn(),
      handleReset: vi.fn(),
      handleImport: vi.fn(),
      addFiles: vi.fn(),
      removeFile: vi.fn(),
      onDragOver: vi.fn(),
      onDragLeave: vi.fn(),
      onDrop: vi.fn(),
      dragging: false,
      importError: null,
    },
    portal: {
      hasToken: true,
      hasPassword: true,
      loading: false,
      result: null,
      dateFrom: "2026-10-01",
      dateTo: "2026-10-23",
      setDateFrom: vi.fn(),
      setDateTo: vi.fn(),
      clearResult: vi.fn(),
      refreshConfig: vi.fn(),
    },
    handleDirectionChange: vi.fn(),
    handleMethodChange: vi.fn(),
    requestClose,
    doClose: vi.fn(),
    handleSync,
    handleBulkXml,
    ...overrides,
  };
}

let state = makeState();

// Slot và callback do cha cung cấp; drawer không tự import modal con
const slots = {
  onOpenLogin: vi.fn(),
  renderXmlPreview: () => null,
  renderInvoiceDetail: () => null,
  renderXmlResultTables: () => null,
};

vi.mock("./useInvoiceImportSyncDrawer", () => ({
  useInvoiceImportSyncDrawer: () => state,
}));

describe("InvoiceImportSyncDrawer", () => {
  beforeEach(() => {
    state = makeState();
    handleSync.mockClear();
  });

  it("renders the GDT sync panel and progress section", () => {
    render(
      <InvoiceImportSyncDrawer
        open
        onClose={vi.fn()}
        onImported={vi.fn()}
        initialDirection="IN"
        {...slots}
      />,
    );

    expect(screen.getByText("Đồng bộ hóa đơn")).toBeInTheDocument();
    expect(screen.getByText("Bắt đầu đồng bộ")).toBeInTheDocument();
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("starts the GDT sync from the primary button", () => {
    render(
      <InvoiceImportSyncDrawer
        open
        onClose={vi.fn()}
        onImported={vi.fn()}
        initialDirection="IN"
        {...slots}
      />,
    );

    fireEvent.click(screen.getByText("Bắt đầu đồng bộ"));
    expect(handleSync).toHaveBeenCalledTimes(1);
  });

  it("shows the XML upload branch when the method is XML", () => {
    state = makeState({ method: "XML" });
    render(
      <InvoiceImportSyncDrawer
        open
        onClose={vi.fn()}
        onImported={vi.fn()}
        initialDirection="IN"
        {...slots}
      />,
    );

    expect(screen.queryByText("Bắt đầu đồng bộ")).toBeNull();
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });
});
