import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CaseLinePaymentPresetBar } from "./CaseLinePaymentPresetBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (typeof opts === "string") return opts;
      if (opts && typeof opts === "object" && opts.defaultValue) {
        return typeof opts.defaultValue === "string" ? opts.defaultValue : k;
      }
      return k;
    },
  }),
}));

describe("CaseLinePaymentPresetBar", () => {
  it("renders all preset buttons with correct counts", () => {
    const onSelectPreset = vi.fn();
    render(
      <CaseLinePaymentPresetBar
        viewPreset="all"
        onSelectPreset={onSelectPreset}
        totalCount={20}
        suggestionsCount={3}
        selectedCount={2}
        linkedCount={1}
      />,
    );

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Gợi ý khớp")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Đang chọn")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Đã cấn trừ")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Gợi ý khớp"));
    expect(onSelectPreset).toHaveBeenCalledWith("suggestions");
  });

  it("shows select all suggestions button when viewing suggestions and count > 0", () => {
    const onSelectAllSuggestions = vi.fn();
    render(
      <CaseLinePaymentPresetBar
        viewPreset="suggestions"
        onSelectPreset={vi.fn()}
        totalCount={10}
        suggestionsCount={4}
        selectedCount={0}
        linkedCount={0}
        onSelectAllSuggestions={onSelectAllSuggestions}
      />,
    );

    const selectAllBtn = screen.getByRole("button", {
      name: /Chọn tất cả gợi ý/i,
    });
    expect(selectAllBtn).toBeInTheDocument();
    fireEvent.click(selectAllBtn);
    expect(onSelectAllSuggestions).toHaveBeenCalled();
  });

  it("shows unselect button when selectedCount > 0", () => {
    const onUnselectAll = vi.fn();
    render(
      <CaseLinePaymentPresetBar
        viewPreset="all"
        onSelectPreset={vi.fn()}
        totalCount={10}
        suggestionsCount={0}
        selectedCount={2}
        linkedCount={0}
        selectedTotal={500000}
        onUnselectAll={onUnselectAll}
      />,
    );

    expect(screen.getByText(/500.000/i)).toBeInTheDocument();
    const unselectBtn = screen.getByRole("button", { name: /Bỏ chọn/i });
    expect(unselectBtn).toBeInTheDocument();
    fireEvent.click(unselectBtn);
    expect(onUnselectAll).toHaveBeenCalled();
  });
});
