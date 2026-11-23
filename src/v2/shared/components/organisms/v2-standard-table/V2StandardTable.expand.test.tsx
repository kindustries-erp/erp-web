import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2StandardTable } from "./V2StandardTable";
import { mockViewport } from "./mocks/V2StandardTable.fixture";
import type { V2Column } from "./V2StandardTable.type";

interface Item {
  id: string;
  name: string;
  children?: string[];
}

const columns: V2Column<Item>[] = [
  {
    key: "name",
    label: "Tên",
    cell: (row) => <span>{row.name}</span>,
  },
];

describe("V2StandardTable Expand Row", () => {
  afterEach(() => vi.restoreAllMocks());

  it("toggles expanded row on chevron click when canExpandRow allows", async () => {
    mockViewport(false);
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const items: Item[] = [
      { id: "1", name: "Tháng 1", children: ["Khoản vay A", "Khoản vay B"] },
      { id: "2", name: "Tháng 2" },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <V2StandardTable<Item>
          tableId="test-expand-table"
          mode="client"
          columns={columns}
          items={items}
          getRowKey={(r) => r.id}
          canExpandRow={(r) => Boolean(r.children && r.children.length > 0)}
          renderExpandedRow={(r) => (
            <div>Chi tiết: {r.children?.join(", ")}</div>
          )}
        />
      </QueryClientProvider>,
    );

    const expandButtons = screen.getAllByRole("button", {
      name: /Mở rộng dòng/i,
    });
    expect(expandButtons).toHaveLength(1);
    expect(
      screen.queryByText("Chi tiết: Khoản vay A, Khoản vay B"),
    ).not.toBeInTheDocument();

    await user.click(expandButtons[0]);
    expect(
      screen.getByText("Chi tiết: Khoản vay A, Khoản vay B"),
    ).toBeInTheDocument();

    const collapseButton = screen.getByRole("button", {
      name: /Thu gọn dòng/i,
    });
    await user.click(collapseButton);
    expect(
      screen.queryByText("Chi tiết: Khoản vay A, Khoản vay B"),
    ).not.toBeInTheDocument();
  });

  it("hides column visibility button when enableColumnVisibility is false", () => {
    mockViewport(false);
    const queryClient = new QueryClient();
    const items: Item[] = [{ id: "1", name: "Tháng 1" }];

    render(
      <QueryClientProvider client={queryClient}>
        <V2StandardTable<Item>
          tableId="test-no-col-toggle"
          mode="client"
          columns={columns}
          items={items}
          getRowKey={(r) => r.id}
          enableColumnVisibility={false}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /Cột/i }),
    ).not.toBeInTheDocument();
  });

  it("không gắn class truncate vào ô expand (tránh dấu ...) và dùng viền mảnh dịu cho hàng mở rộng", async () => {
    mockViewport(false);
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const items: Item[] = [{ id: "1", name: "Tháng 1", children: ["Khoản A"] }];

    render(
      <QueryClientProvider client={queryClient}>
        <V2StandardTable<Item>
          tableId="test-expand-style"
          mode="client"
          columns={columns}
          items={items}
          getRowKey={(r) => r.id}
          canExpandRow={(r) => Boolean(r.children && r.children.length > 0)}
          renderExpandedRow={(r) => <div>Sub: {r.children?.join(",")}</div>}
        />
      </QueryClientProvider>,
    );

    const expandBtn = screen.getByRole("button", { name: /Mở rộng dòng/i });
    const expandCell = expandBtn.closest("td");
    expect(expandCell).not.toBeNull();
    expect(expandCell?.className).not.toContain("truncate");
    expect(expandCell?.className).toContain("px-1");

    await user.click(expandBtn);
    const subContent = screen.getByText("Sub: Khoản A");
    const expandedWrapper = subContent.parentElement;
    expect(expandedWrapper?.className).toContain("border-l-2");
    expect(expandedWrapper?.className).not.toContain("border-l-4");
  });
});
