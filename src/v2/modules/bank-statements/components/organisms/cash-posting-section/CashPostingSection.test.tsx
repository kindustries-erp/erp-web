import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CashPostingSection } from "./CashPostingSection";
import type { CashPostingDraft } from "./CashPostingSection.type";

const t = (key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key;
const accounts = [{ value: "1111", label: "1111 - Quỹ" }];

const base: CashPostingDraft = {
  accountingEnabled: false,
  postingDate: "2026-10-01",
  description: "",
  lines: [],
  isPosted: false,
  journalNo: null,
  summary: null,
};

const handlers = () => ({
  onToggleAccounting: vi.fn(),
  onPostingDateChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onLinesChange: vi.fn(),
});

describe("CashPostingSection", () => {
  it("xem: chưa ghi sổ thì báo chưa hạch toán", () => {
    render(
      <CashPostingSection
        posting={base}
        editMode={false}
        accounts={accounts}
        t={t}
        {...handlers()}
      />,
    );
    expect(
      screen.getByText("v2.bankStatements.cashDetail.posting.notPosted"),
    ).toBeTruthy();
  });

  it("sửa: bật công tắc gọi onToggleAccounting(true)", () => {
    const h = handlers();
    render(
      <CashPostingSection
        posting={base}
        editMode
        accounts={accounts}
        t={t}
        {...h}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(h.onToggleAccounting).toHaveBeenCalledWith(true);
  });

  it("sửa khi đang bật: hiện nút thêm dòng", () => {
    render(
      <CashPostingSection
        posting={{ ...base, accountingEnabled: true }}
        editMode
        accounts={accounts}
        t={t}
        {...handlers()}
      />,
    );
    expect(screen.getByRole("button", { name: /Thêm dòng/ })).toBeTruthy();
  });
});
