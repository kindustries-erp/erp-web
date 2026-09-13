// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpreadsheetPageTemplate } from "../SpreadsheetPageTemplate";
import type { SpreadsheetPageTemplateProps } from "../types";

// Mock the i18n hook
vi.mock("@/core/i18n", () => ({
  useT: () => (key: string) => {
    const translations: Record<string, string> = {
      "common.noData": "MOCKED_NO_DATA",
      "panel.createNew": "MOCKED_CREATE_NEW",
    };
    return translations[key] || key;
  },
}));

// Mock ResizeObserver for StandardTable / DataTable
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock TableActionGroup
vi.mock("@/shared/components/TableActionGroup", () => ({
  TableActionGroup: (props: {
    createLabel?: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="mock-table-action-group">
      <span data-testid="mock-create-label">{props.createLabel}</span>
      <div data-testid="mock-children">{props.children}</div>
    </div>
  ),
}));

describe("SpreadsheetPageTemplate", () => {
  const defaultProps: SpreadsheetPageTemplateProps<Record<string, unknown>> = {
    title: "Test Title",
    desc: "Test Description",
    icon: <div data-testid="test-icon" />,
    tableId: "test-table",
    items: [],
    columns: [
      { key: "id", header: "ID", cell: (info: unknown) => String(info) },
    ],
    getRowKey: (row: Record<string, unknown>) => String(row.id),
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    onPage: vi.fn(),
    onPageSize: vi.fn(),
  };

  it("renders the layout correctly with title and description", () => {
    render(<SpreadsheetPageTemplate {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("uses i18n default labels when emptyLabel and createLabel are omitted", () => {
    render(<SpreadsheetPageTemplate {...defaultProps} onCreate={vi.fn()} />);

    // Check if the empty label is rendered inside the table (using the mocked translation)
    expect(screen.getByText("MOCKED_NO_DATA")).toBeInTheDocument();

    // Check if the createLabel is passed to TableActionGroup correctly
    expect(screen.getByTestId("mock-create-label")).toHaveTextContent(
      "MOCKED_CREATE_NEW",
    );
  });

  it("uses custom emptyLabel and createLabel when explicitly provided", () => {
    render(
      <SpreadsheetPageTemplate
        {...defaultProps}
        onCreate={vi.fn()}
        emptyLabel="CUSTOM_EMPTY"
        createLabel="CUSTOM_CREATE"
      />,
    );

    expect(screen.getByText("CUSTOM_EMPTY")).toBeInTheDocument();
    expect(screen.getByTestId("mock-create-label")).toHaveTextContent(
      "CUSTOM_CREATE",
    );

    // The mocked defaults should not be present
    expect(screen.queryByText("MOCKED_NO_DATA")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-create-label")).not.toHaveTextContent(
      "MOCKED_CREATE_NEW",
    );
  });

  it("passes bulkActionsNode to the action group", () => {
    render(
      <SpreadsheetPageTemplate
        {...defaultProps}
        bulkActionsNode={<button>MOCKED_BULK_ACTION</button>}
      />,
    );
    expect(screen.getByText("MOCKED_BULK_ACTION")).toBeInTheDocument();
  });

  it("applies getRowClassName correctly to rendered rows", () => {
    const items = [
      { id: "1", status: "ADJUSTED" },
      { id: "2", status: "NORMAL" },
    ];
    const { container } = render(
      <SpreadsheetPageTemplate
        {...defaultProps}
        items={items}
        getRowClassName={(row) =>
          row.status === "ADJUSTED" ? "bg-amber-50/80" : undefined
        }
      />,
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.className).toContain("bg-amber-50/80");
    expect(rows[1]?.className).not.toContain("bg-amber-50/80");
  });
});
