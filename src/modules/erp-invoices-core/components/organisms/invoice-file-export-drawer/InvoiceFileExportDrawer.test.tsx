import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { InvoiceFileExportDrawer } from "./InvoiceFileExportDrawer";

const bulkDownloadSelected = vi.fn().mockResolvedValue(new Blob(["z"]));
const bulkDownloadFiles = vi.fn().mockResolvedValue(new Blob(["z"]));

vi.mock("@/modules/erp-invoices-core/api/erpInvoicesCoreApi", () => ({
  erpInvoicesCoreApi: {
    bulkDownloadSelected: (...a: any[]) => bulkDownloadSelected(...a),
    bulkDownloadFiles: (...a: any[]) => bulkDownloadFiles(...a),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, opts?: any) =>
      (fallback || _key).replace("{{count}}", String(opts?.count ?? "")),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/shared/components/StandardFormDrawer", () => ({
  StandardFormDrawer: ({ title, leftPanel, rightPanel }: any) => (
    <div>
      <h1>{title}</h1>
      {leftPanel}
      {rightPanel}
    </div>
  ),
}));

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: () => <div data-testid="period-combobox" />,
}));
vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: () => <div data-testid="date-picker" />,
}));
vi.mock("@/shared/components/ui/Button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
vi.mock("@/shared/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  direction: "IN" as const,
  buildBaseQuery: () => ({ status: "PAID", search: "abc" }),
};

describe("InvoiceFileExportDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
  });

  it("defaults to the selected mode and downloads the selected invoices", async () => {
    render(<InvoiceFileExportDrawer {...baseProps} selectedIds={["a", "b"]} />);

    expect(screen.getByText("Xuất PDF hóa đơn")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getAllByRole("radio")[0]).toBeChecked();

    fireEvent.click(screen.getByText("Tải ZIP"));
    await waitFor(() =>
      expect(bulkDownloadSelected).toHaveBeenCalledWith({
        ids: ["a", "b"],
        types: ["pdf"],
      }),
    );
    expect(bulkDownloadFiles).not.toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("hides the selected mode without a selection and exports by period", async () => {
    render(<InvoiceFileExportDrawer {...baseProps} selectedIds={[]} />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getAllByRole("radio")[0]).toBeChecked();

    fireEvent.click(screen.getByText("Tải ZIP"));
    await waitFor(() => expect(bulkDownloadFiles).toHaveBeenCalledTimes(1));
    const arg = bulkDownloadFiles.mock.calls[0][0];
    expect(arg.types).toEqual(["pdf"]);
    expect(arg.query.direction).toBe("IN");
    expect(arg.query.date_from).toMatch(/T00:00:00$/);
    expect(arg.query.date_to).toMatch(/T23:59:59$/);
  });

  it("blocks the download when no file type is chosen", async () => {
    render(<InvoiceFileExportDrawer {...baseProps} selectedIds={["a"]} />);

    const [pdfBox] = screen
      .getAllByRole("checkbox")
      .filter((el) => (el as HTMLInputElement).checked);
    fireEvent.click(pdfBox);
    fireEvent.click(screen.getByText("Tải ZIP"));

    await waitFor(() => expect(bulkDownloadSelected).not.toHaveBeenCalled());
  });
});
