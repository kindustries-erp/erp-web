import React, { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, VoucherTypeBadge, TagCell } from "../badges";
import { StatusBadge as PartnerStatusBadge } from "@/modules/partners/components/shared";
import { Tooltip, TooltipProvider } from "@/core/components/ui/Tooltip";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, fallback?: string) => {
    const map: Record<string, string> = {
      "voucher.status.draft": "Bản nháp",
      "voucher.status.approved": "Đã duyệt",
      "status.CONFIRMED": "Đã chốt",
      "status.active": "Đang hoạt động",
      "status.inactive": "Ngừng hoạt động",
    };
    return map[key] ?? fallback ?? key;
  },
}));

describe("StatusBadge Component", () => {
  it("renders mapped i18n status correctly", () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Bản nháp")).toBeInTheDocument();
  });

  it("falls back to default label when i18n key is missing", () => {
    render(<StatusBadge status="PENDING_APPROVAL" />);
    expect(screen.getByText("Chờ duyệt")).toBeInTheDocument();
  });

  it("falls back to status string for unknown status", () => {
    render(<StatusBadge status="CUSTOM_UNKNOWN_STATUS" />);
    expect(screen.getByText("CUSTOM_UNKNOWN_STATUS")).toBeInTheDocument();
  });

  it("applies custom className and passes through HTML attributes", () => {
    render(
      <StatusBadge
        status="APPROVED"
        className="my-custom-class"
        data-testid="status-badge"
        id="status-approved"
      />,
    );
    const element = screen.getByTestId("status-badge");
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("my-custom-class");
    expect(element).toHaveAttribute("id", "status-approved");
  });

  it("forwards ref to the underlying span element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusBadge status="APPROVED" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe("Đã duyệt");
  });

  it("renders seamlessly inside Radix Tooltip without throwing ref error", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <TooltipProvider>
        <Tooltip content="Tooltip nội dung chi tiết">
          <StatusBadge status="CONFIRMED" data-testid="tooltip-badge" />
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByTestId("tooltip-badge")).toBeInTheDocument();
    expect(screen.getByText("Đã chốt")).toBeInTheDocument();

    // Verify no ref warning was logged by React
    const refWarnings = consoleErrorSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" &&
          arg.includes("Function components cannot be given refs"),
      ),
    );
    expect(refWarnings).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});

describe("VoucherTypeBadge Component", () => {
  it("renders voucher type label PT for CASH_RECEIPT", () => {
    render(<VoucherTypeBadge type="CASH_RECEIPT" />);
    expect(screen.getByText("PT")).toBeInTheDocument();
  });

  it("renders voucher type label UNC for BANK_PAYMENT", () => {
    render(<VoucherTypeBadge type="BANK_PAYMENT" />);
    expect(screen.getByText("UNC")).toBeInTheDocument();
  });

  it("renders raw type when unknown", () => {
    render(<VoucherTypeBadge type="OTHER_TYPE" />);
    expect(screen.getByText("OTHER_TYPE")).toBeInTheDocument();
  });

  it("forwards ref to the underlying span element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<VoucherTypeBadge type="CASH_PAYMENT" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe("PC");
  });
});

describe("TagCell Component", () => {
  it("renders active badge when active is true", () => {
    render(<TagCell active={true} />);
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
  });

  it("renders inactive badge when active is false", () => {
    render(<TagCell active={false} />);
    expect(screen.getByText("Tắt")).toBeInTheDocument();
  });

  it("renders default tag when isDefault is true", () => {
    render(<TagCell active={true} isDefault={true} />);
    expect(screen.getByText("Mặc định")).toBeInTheDocument();
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
  });

  it("forwards ref to the underlying div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TagCell active={true} ref={ref} data-testid="tag-cell-container" />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId("tag-cell-container")).toBe(ref.current);
  });
});

describe("PartnerStatusBadge Component (modules/partners)", () => {
  it("renders active and inactive states", () => {
    const { rerender } = render(<PartnerStatusBadge active={true} />);
    expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();

    rerender(<PartnerStatusBadge active={false} />);
    expect(screen.getByText("Ngừng hoạt động")).toBeInTheDocument();
  });

  it("forwards ref to the underlying span element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<PartnerStatusBadge active={true} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe("Đang hoạt động");
  });
});
