import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoiceGdtSyncResult } from "./InvoiceGdtSyncResult";

// Trả về chuỗi mặc định (có nội suy {{biến}}) để giữ nguyên các assertion theo nhãn
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown) => {
      if (typeof fallback === "string") return fallback;
      const opts = fallback as Record<string, unknown> | undefined;
      const template = (opts?.defaultValue as string | undefined) ?? key;
      return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(opts?.[name] ?? ""),
      );
    },
  }),
}));

describe("InvoiceGdtSyncResult", () => {
  it("hiển thị số hóa đơn mới, trùng và số file XML xếp hàng", () => {
    render(
      <InvoiceGdtSyncResult
        result={
          {
            imported: 3,
            skipped: 1,
            xmlDownloadQueued: 4,
            errors: [],
          } as never
        }
      />,
    );

    expect(screen.getByText("Đồng bộ thành công")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("hiển thị ghi chú của server thay cho bảng số liệu khi có note", () => {
    render(
      <InvoiceGdtSyncResult
        result={
          {
            note: "Không có hóa đơn mới",
            imported: 0,
            skipped: 0,
            xmlDownloadQueued: 0,
            errors: [],
          } as never
        }
      />,
    );

    expect(screen.getByText("Không có hóa đơn mới")).toBeInTheDocument();
    expect(screen.queryByText("hóa đơn mới")).toBeNull();
  });

  it("hiển thị số lỗi khi có lỗi", () => {
    render(
      <InvoiceGdtSyncResult
        result={
          {
            imported: 0,
            skipped: 0,
            xmlDownloadQueued: 0,
            errors: [{ reason: "a" }, { reason: "b" }],
          } as never
        }
      />,
    );

    expect(screen.getByText("2 lỗi")).toBeInTheDocument();
  });
});
