import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowPrintLoading } from "./GarageCashflowPrintLoading";

vi.mock("@/core/i18n", () => ({
  useT: () => (_key: string, fallback?: string) => fallback ?? "",
}));

describe("GarageCashflowPrintLoading", () => {
  it("hiện lớp phủ loading kèm thông báo khi đang chuẩn bị bản in", () => {
    render(<GarageCashflowPrintLoading open />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Đang chuẩn bị bản in…");
  });

  it("không render gì khi không ở trạng thái in", () => {
    const { container } = render(<GarageCashflowPrintLoading open={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
