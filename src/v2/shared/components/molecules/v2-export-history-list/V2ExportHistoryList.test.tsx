import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ExportHistoryList } from "./V2ExportHistoryList";
import type { V2ExportHistoryItem } from "./V2ExportHistoryList.type";

const baseProps = {
  emptyLabel: "Chưa có file xuất nào",
  downloadLabel: "Tải file",
  downloadingLabel: "Đang tải...",
  onDownload: vi.fn(),
  page: 1,
  pageSize: 10,
  total: 1,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

const item: V2ExportHistoryItem = {
  id: "job-1",
  fileName: "Bao_cao_VINFAST_2026-03.xlsx",
  periodLabel: "01/03/2026 - 31/03/2026",
  createdAt: "25/10/2026 09:00",
  statusTone: "ready",
  statusLabel: "Sẵn sàng tải",
  canDownload: true,
};

describe("V2ExportHistoryList", () => {
  it("shows the empty label when there are no items", () => {
    render(<V2ExportHistoryList {...baseProps} items={[]} />);
    expect(screen.getByText("Chưa có file xuất nào")).toBeInTheDocument();
  });

  it("calls onDownload with the job id when the download button is clicked", () => {
    const onDownload = vi.fn();
    render(
      <V2ExportHistoryList
        {...baseProps}
        items={[item]}
        onDownload={onDownload}
      />,
    );

    expect(screen.getByText(item.fileName)).toBeInTheDocument();
    expect(screen.getByText("Sẵn sàng tải")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tải file" }));
    expect(onDownload).toHaveBeenCalledWith("job-1");
  });

  it("disables download while the file is not ready", () => {
    render(
      <V2ExportHistoryList
        {...baseProps}
        items={[
          {
            ...item,
            canDownload: false,
            statusTone: "running",
            statusLabel: "Đang tạo 40%",
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Tải file" })).toBeDisabled();
  });

  it("không bọc danh sách bằng khung viền; mỗi file là thẻ mềm riêng", () => {
    render(<V2ExportHistoryList {...baseProps} items={[item]} />);

    const list = screen.getByRole("list");
    expect(list.className).not.toMatch(/\bborder\b/);
    expect(list.className).not.toMatch(/divide-y/);
    expect(screen.getByRole("listitem").className).toMatch(/bg-surface/);
  });
});
