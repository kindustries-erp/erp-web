// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DataTable, type DataTableColumn } from "../index";
import { useUserPreferencesStore } from "@/shared/hooks/useUserPreferences";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

interface TestItem {
  id: string;
  code: string;
  name: string;
  amount: number;
  status: string;
  notes: string;
}

describe("DataTable Column Visibility Dynamic Update Suite", () => {
  const mockItems: TestItem[] = [
    {
      id: "1",
      code: "INV-001",
      name: "Bóng đèn",
      amount: 100000,
      status: "ACTIVE",
      notes: "Ghi chú 1",
    },
  ];

  const columns: DataTableColumn<TestItem>[] = [
    {
      key: "code",
      header: "Mã",
      cell: (item) => <span data-testid="cell-code">{item.code}</span>,
    },
    {
      key: "name",
      header: "Tên hàng",
      cell: (item) => <span data-testid="cell-name">{item.name}</span>,
    },
    {
      key: "amount",
      header: "Thành tiền",
      cell: (item) => (
        <span data-testid="cell-amount">{item.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => <span data-testid="cell-status">{item.status}</span>,
    },
    {
      key: "notes",
      header: "Ghi chú",
      cell: (item) => <span data-testid="cell-notes">{item.notes}</span>,
    },
  ];

  function TestTableWrapper() {
    const tableId = "test-visibility-table";
    return (
      <DataTable
        tableId={tableId}
        items={mockItems}
        columns={columns}
        getRowKey={(r) => r.id}
        emptyLabel="Chưa có dữ liệu"
        defaultColumnVisibility={{
          code: true,
          name: true,
          amount: true,
          status: false,
          notes: false,
        }}
      />
    );
  }

  it("updates row cells synchronously when column visibility changes in preferences store", () => {
    useUserPreferencesStore.setState({ tables: {} });
    render(<TestTableWrapper />);

    // In initial view: code, name, amount are visible
    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.getByText("Tên hàng")).toBeInTheDocument();
    expect(screen.getByText("Thành tiền")).toBeInTheDocument();
    expect(screen.queryByText("Trạng thái")).not.toBeInTheDocument();
    expect(screen.queryByText("Ghi chú")).not.toBeInTheDocument();

    expect(screen.getByTestId("cell-code")).toHaveTextContent("INV-001");
    expect(screen.getByTestId("cell-name")).toHaveTextContent("Bóng đèn");
    expect(screen.getByTestId("cell-amount")).toHaveTextContent("100,000");
    expect(screen.queryByTestId("cell-status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cell-notes")).not.toBeInTheDocument();

    // Switch to Audit view: hide name & amount, show status & notes
    act(() => {
      useUserPreferencesStore
        .getState()
        .setTablePreferences("test-visibility-table", {
          columnOrder: [],
          columnVisibility: {
            code: true,
            name: false,
            amount: false,
            status: true,
            notes: true,
          },
          activeView: "audit",
        });
    });

    // In audit view: code, status, notes must be visible; name & amount hidden
    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.queryByText("Tên hàng")).not.toBeInTheDocument();
    expect(screen.queryByText("Thành tiền")).not.toBeInTheDocument();
    expect(screen.getByText("Trạng thái")).toBeInTheDocument();
    expect(screen.getByText("Ghi chú")).toBeInTheDocument();

    // Row cells MUST match the new columns and not remain stale
    expect(screen.getByTestId("cell-code")).toHaveTextContent("INV-001");
    expect(screen.queryByTestId("cell-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cell-amount")).not.toBeInTheDocument();
    expect(screen.getByTestId("cell-status")).toHaveTextContent("ACTIVE");
    expect(screen.getByTestId("cell-notes")).toHaveTextContent("Ghi chú 1");

    // Switch back to Overview view
    act(() => {
      useUserPreferencesStore
        .getState()
        .setTablePreferences("test-visibility-table", {
          columnOrder: [],
          columnVisibility: {
            code: true,
            name: true,
            amount: true,
            status: false,
            notes: false,
          },
          activeView: "overview",
        });
    });

    expect(screen.getByText("Mã")).toBeInTheDocument();
    expect(screen.getByText("Tên hàng")).toBeInTheDocument();
    expect(screen.getByText("Thành tiền")).toBeInTheDocument();
    expect(screen.queryByText("Trạng thái")).not.toBeInTheDocument();
    expect(screen.queryByText("Ghi chú")).not.toBeInTheDocument();

    expect(screen.getByTestId("cell-code")).toHaveTextContent("INV-001");
    expect(screen.getByTestId("cell-name")).toHaveTextContent("Bóng đèn");
    expect(screen.getByTestId("cell-amount")).toHaveTextContent("100,000");
    expect(screen.queryByTestId("cell-status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cell-notes")).not.toBeInTheDocument();
  });
});
