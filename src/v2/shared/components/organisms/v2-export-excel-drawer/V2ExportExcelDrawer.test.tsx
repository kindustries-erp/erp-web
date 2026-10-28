import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2ExportExcelDrawer } from "./V2ExportExcelDrawer";

const props = {
  open: true,
  onClose: vi.fn(),
  title: "Xuất Excel thử nghiệm",
  columnGroups: [
    {
      key: "summary",
      label: "Nhóm tổng hợp",
      columns: [{ key: "sku", label: "Mã phụ tùng" }],
    },
  ],
  selectedColumns: ["sku"],
  defaultColumns: ["sku"],
  onColumnsChange: vi.fn(),
  columnsTitle: "Cột xuất Excel",
  historyTitle: "Lịch sử xuất file",
  history: <div>Danh sách lịch sử</div>,
  conditions: <div>Điều kiện xuất</div>,
};

describe("V2ExportExcelDrawer", () => {
  it("renders the title and both panels", () => {
    render(<V2ExportExcelDrawer {...props} />);

    expect(screen.getByText("Xuất Excel thử nghiệm")).toBeInTheDocument();
    expect(screen.getByText("Nhóm tổng hợp")).toBeInTheDocument();
    expect(screen.getByText("Danh sách lịch sử")).toBeInTheDocument();
    expect(screen.getByText("Điều kiện xuất")).toBeInTheDocument();
  });
});
