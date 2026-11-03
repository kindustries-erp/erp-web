import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2SyncProgress } from "./V2SyncProgress";
import type { V2SyncProgressLabels } from "./V2SyncProgress.type";

const labels: V2SyncProgressLabels = {
  empty: "Chưa có tiến trình nào...",
  running: "Đang đồng bộ",
  done: "Hoàn tất",
  error: "Đồng bộ thất bại",
};

const at = new Date(2026, 9, 23, 9, 5, 7).getTime();

describe("V2SyncProgress", () => {
  it("shows the empty text and 0% before anything runs", () => {
    render(<V2SyncProgress status="idle" logs={[]} labels={labels} />);

    expect(screen.getByText("Chưa có tiến trình nào...")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText("Đang đồng bộ")).toBeNull();
  });

  it("renders the running label, percentage, and timestamped log lines", () => {
    render(
      <V2SyncProgress
        status="running"
        progress={45}
        logs={[{ at, message: "Đang tải chi tiết" }]}
        labels={labels}
      />,
    );

    expect(screen.getByText("Đang đồng bộ")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("Đang tải chi tiết")).toBeInTheDocument();
    expect(screen.getByText("[09:05:07]")).toBeInTheDocument();
  });

  it("forces 100% and the done label when the sync completes", () => {
    render(
      <V2SyncProgress status="done" progress={60} logs={[]} labels={labels} />,
    );

    expect(screen.getByText("Hoàn tất")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("uses the error label and rose tone when the sync fails", () => {
    const { container } = render(
      <V2SyncProgress
        status="error"
        progress={30}
        logs={[{ at, message: "Lỗi", level: "error" }]}
        labels={labels}
      />,
    );

    expect(screen.getByText("Đồng bộ thất bại")).toBeInTheDocument();
    expect(screen.getByText("Lỗi")).toHaveClass("text-rose-300");
    expect(container.querySelector(".bg-rose-500")).not.toBeNull();
  });

  it("exposes the console as a live log region with dark-mode classes", () => {
    render(<V2SyncProgress status="running" logs={[]} labels={labels} />);

    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveClass("dark:bg-black/40");
  });

  it("shows the invoice being processed only while running", () => {
    const { rerender } = render(
      <V2SyncProgress
        status="running"
        progress={20}
        currentItem="HĐ 1847 · C26MSP · ABC"
        logs={[]}
        labels={{ ...labels, currentItem: "Đang xử lý" }}
      />,
    );
    expect(
      screen.getByText(/Đang xử lý: HĐ 1847 · C26MSP · ABC/),
    ).toBeInTheDocument();

    rerender(
      <V2SyncProgress
        status="done"
        progress={100}
        currentItem="HĐ 1847 · C26MSP · ABC"
        logs={[]}
        labels={{ ...labels, currentItem: "Đang xử lý" }}
      />,
    );
    expect(screen.queryByText(/HĐ 1847/)).toBeNull();
  });

  it("fills the remaining height when fillHeight is set, otherwise keeps a fixed height", () => {
    const { rerender } = render(
      <V2SyncProgress status="running" logs={[]} labels={labels} />,
    );
    expect(screen.getByRole("log")).toHaveClass("h-64");

    rerender(
      <V2SyncProgress status="running" logs={[]} labels={labels} fillHeight />,
    );
    expect(screen.getByRole("log")).toHaveClass("flex-1", "min-h-0");
    expect(screen.getByRole("log")).not.toHaveClass("h-64");
  });
});
