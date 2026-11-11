import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { V2DrawerLinesTable } from "./V2DrawerLinesTable";
import type { V2DrawerLinesColumn } from "./V2DrawerLinesTable.type";

const columns: V2DrawerLinesColumn[] = [
  { id: "name", header: "Tên", grow: true, minWidth: 160, wrap: true },
  { id: "qty", header: "Số lượng", width: 96, align: "right" },
  { id: "amount", header: "Thành tiền", width: 150, align: "right" },
];

const rows = [{ id: "a", name: "Lọc dầu", qty: 2, amount: 200 }];

describe("V2DrawerLinesTable", () => {
  it("đặt colgroup theo độ rộng cố định, cột grow không có width", () => {
    const { container } = render(
      <V2DrawerLinesTable
        ariaLabel="demo"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        renderCell={(col, row) => String(row[col.id as keyof typeof row])}
      />,
    );
    const cols = container.querySelectorAll("colgroup col");
    expect(cols).toHaveLength(3);
    expect((cols[0] as HTMLElement).style.width).toBe("");
    expect((cols[1] as HTMLElement).style.width).toBe("96px");
  });

  it("header không xuống dòng và cuộn được trong một vùng có maxHeight", () => {
    const { container } = render(
      <V2DrawerLinesTable
        ariaLabel="demo"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        renderCell={() => "x"}
        maxHeight="320px"
      />,
    );
    const th = screen.getByRole("columnheader", { name: "Số lượng" });
    expect(th.className).toContain("whitespace-nowrap");
    const scroller = container.firstElementChild as HTMLElement;
    expect(scroller.className).toContain("overflow-auto");
    expect(scroller.style.maxHeight).toBe("320px");
    expect(container.querySelector("thead")?.className).toContain("sticky");
  });

  it("ô nội dung dài được phép xuống dòng, ô số thì không", () => {
    render(
      <V2DrawerLinesTable
        ariaLabel="demo"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        renderCell={(col, row) => String(row[col.id as keyof typeof row])}
      />,
    );
    expect(screen.getByRole("cell", { name: "Lọc dầu" }).className).toContain(
      "whitespace-normal",
    );
    expect(screen.getByRole("cell", { name: "2" }).className).toContain(
      "whitespace-nowrap",
    );
  });

  it("hiện chân bảng dính đáy với nhãn và ô tổng", () => {
    const { container } = render(
      <V2DrawerLinesTable
        ariaLabel="demo"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        renderCell={() => "x"}
        footerLabel="Tổng cộng:"
        footerCells={{ qty: "2", amount: "200" }}
      />,
    );
    expect(screen.getByText("Tổng cộng:")).toBeTruthy();
    expect(container.querySelector("tfoot")?.className).toContain("sticky");
  });

  it("hiện nhãn rỗng khi không có dòng", () => {
    render(
      <V2DrawerLinesTable
        ariaLabel="demo"
        columns={columns}
        rows={[] as { id: string }[]}
        getRowKey={(r) => r.id}
        renderCell={() => "x"}
        emptyLabel="Trống"
      />,
    );
    expect(screen.getByText("Trống")).toBeTruthy();
  });
});
