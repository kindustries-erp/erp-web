import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SuggestionPillStrip } from "./SuggestionPillStrip";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, opts?: Record<string, unknown>) => {
      const text = fallback ?? key;
      return text.replace(/{{(\w+)}}/g, (_, k: string) =>
        String(opts?.[k] ?? ""),
      );
    },
    i18n: { language: "vi" },
  }),
}));

const item = (id: string, amount: number, badge: any = "HIGH") =>
  ({
    txn: {
      id,
      transDate: "2026-10-16T10:00:00Z",
      referenceNumber: `REF-${id}`,
      description: `Noi dung ${id}`,
      debitAmount: amount,
      creditAmount: 0,
      sourceType: "BANK",
      correspondentName: `DOI TAC ${id}`,
      remainingAmount: amount,
    },
    score: {
      score: 82,
      amountMatch: true,
      invoiceNoMatch: false,
      correspondentMatch: true,
      badge,
    },
    matchedKeywords: [],
    reasons: [
      {
        key: "AMOUNT_REMAINING",
        label: "Khớp đúng số còn phải thu",
        matched: true,
      },
    ],
  }) as any;

const base = {
  suggestions: [item("a", 540000), item("b", 9261617), item("c", 4342782)],
  selectedIds: [] as string[],
  onToggle: vi.fn(),
  onSelectAll: vi.fn(),
};

describe("SuggestionPillStrip", () => {
  it("render một pill cho mỗi gợi ý và số lượng ở tiêu đề", () => {
    render(<SuggestionPillStrip {...base} />);

    expect(screen.getByText("Gợi ý khớp (3)")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3);
  });

  it("bấm pill gọi onToggle với txn tương ứng", () => {
    const onToggle = vi.fn();
    render(<SuggestionPillStrip {...base} onToggle={onToggle} />);

    fireEvent.click(screen.getAllByRole("button", { pressed: false })[0]);

    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
  });

  it("pill đã chọn có aria-pressed=true", () => {
    render(<SuggestionPillStrip {...base} selectedIds={["b"]} />);

    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
  });

  it("'Chọn tất cả' chỉ đếm gợi ý chưa chọn và gọi onSelectAll", () => {
    const onSelectAll = vi.fn();
    render(
      <SuggestionPillStrip
        {...base}
        selectedIds={["a"]}
        onSelectAll={onSelectAll}
      />,
    );

    const btn = screen.getByText("Chọn tất cả (2)");
    fireEvent.click(btn);

    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("không hiện 'Chọn tất cả' khi còn dưới 2 gợi ý chưa chọn", () => {
    render(<SuggestionPillStrip {...base} selectedIds={["a", "b"]} />);

    expect(screen.queryByText(/Chọn tất cả/)).not.toBeInTheDocument();
  });

  it("đang tải thì hiện skeleton, không hiện số lượng", () => {
    const { container } = render(
      <SuggestionPillStrip {...base} suggestions={[]} isLoading={true} />,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
    expect(screen.queryByText(/Gợi ý khớp \(/)).not.toBeInTheDocument();
  });

  it("không có gợi ý thì không render gì", () => {
    const { container } = render(
      <SuggestionPillStrip {...base} suggestions={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("hover đủ lâu thì hiện popover có lý do và nội dung sao kê", async () => {
    render(<SuggestionPillStrip {...base} />);
    const pill = screen.getAllByRole("button", { pressed: false })[0];

    fireEvent.mouseEnter(pill);

    expect(
      await screen.findByText("Khớp đúng số còn phải thu", undefined, {
        timeout: 1000,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Noi dung a")).toBeInTheDocument();
  });

  it("rời chuột thì popover đóng", async () => {
    render(<SuggestionPillStrip {...base} />);
    const pill = screen.getAllByRole("button", { pressed: false })[0];

    fireEvent.mouseEnter(pill);
    await screen.findByText("Khớp đúng số còn phải thu");
    fireEvent.mouseLeave(pill);

    await waitFor(() =>
      expect(
        screen.queryByText("Khớp đúng số còn phải thu"),
      ).not.toBeInTheDocument(),
    );
  });

  it("bấm pill không mở popover", () => {
    const onToggle = vi.fn();
    render(<SuggestionPillStrip {...base} onToggle={onToggle} />);

    fireEvent.click(screen.getAllByRole("button", { pressed: false })[0]);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Khớp đúng số còn phải thu"),
    ).not.toBeInTheDocument();
  });
});
