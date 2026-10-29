import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceSyncDrawer } from "./InvoiceSyncDrawer";
import type { InvoiceSyncDrawerProps } from "./InvoiceSyncDrawer.type";
import { useInvoiceSyncPeriod } from "./InvoiceSyncDrawer.period.hook";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: any) =>
      typeof fallback === "object"
        ? fallback.defaultValue || _key
        : fallback || _key,
  }),
}));

type HarnessProps = Partial<Omit<InvoiceSyncDrawerProps, "period">> & {
  onSync?: () => void;
};

/** Dựng drawer với state kỳ thật từ hook, giống cách container dùng */
function Harness({ onSync = vi.fn(), ...overrides }: HarnessProps) {
  const period = useInvoiceSyncPeriod();
  return (
    <InvoiceSyncDrawer
      open
      onClose={vi.fn()}
      confirmOnClose={false}
      direction="IN"
      onDirectionChange={vi.fn()}
      method="GDT"
      onMethodChange={vi.fn()}
      period={period}
      canEditInvoice
      noCredential={false}
      syncing={false}
      bulkXmlLoading={false}
      onOpenLogin={vi.fn()}
      onBulkXml={vi.fn()}
      onSync={onSync}
      progress={{ status: "idle", progress: 0, logs: [] }}
      actions={[]}
      {...overrides}
    />
  );
}

describe("InvoiceSyncDrawer (V2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị nút đồng bộ và ước tính lượt quét khi nguồn là GDT", () => {
    render(<Harness />);

    expect(screen.getByText("Bắt đầu đồng bộ")).toBeTruthy();
    expect(screen.getByText(/Ước tính/)).toBeTruthy();
  });

  it("gọi onSync khi bấm bắt đầu đồng bộ", () => {
    const onSync = vi.fn();
    render(<Harness onSync={onSync} />);

    fireEvent.click(screen.getByText("Bắt đầu đồng bộ"));

    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it("chặn đồng bộ và hiện cảnh báo khi chưa có tài khoản Cổng Thuế", () => {
    render(<Harness noCredential />);

    expect(screen.getByRole("alert")).toBeTruthy();
    const syncButton = screen.getByText("Bắt đầu đồng bộ").closest("button");
    expect(syncButton?.disabled).toBe(true);
  });

  it("ẩn nút GDT và hiện slot XML khi nguồn là file XML", () => {
    render(<Harness method="XML" xmlPanel={<div>Vùng chọn file XML</div>} />);

    expect(screen.queryByText("Bắt đầu đồng bộ")).toBeNull();
    expect(screen.getByText("Vùng chọn file XML")).toBeTruthy();
  });

  it("hiện slot kết quả GDT khi có", () => {
    render(<Harness gdtResult={<div>Đã lấy 3 hóa đơn mới</div>} />);

    expect(screen.getByText("Đã lấy 3 hóa đơn mới")).toBeTruthy();
  });
});
