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
  it("renders 3 preset tabs with correct counts in prioritized order", () => {
    const onSelectPreset = vi.fn();
    render(
      <CaseLinePaymentPresetBar
        viewPreset="all"
        onSelectPreset={onSelectPreset}
        totalCount={20}
        suggestionsCount={3}
        linkedCount={1}
      />,
    );

    // Thứ tự hiển thị: Đã cấn trừ -> Gợi ý khớp -> Tất cả
    expect(screen.getByText("Đã cấn trừ")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Gợi ý khớp")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.queryByText("Đang chọn")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Gợi ý khớp"));
    expect(onSelectPreset).toHaveBeenCalledWith("suggestions");

    fireEvent.click(screen.getByText("Đã cấn trừ"));
    expect(onSelectPreset).toHaveBeenCalledWith("linked");

    fireEvent.click(screen.getByText("Tất cả"));
    expect(onSelectPreset).toHaveBeenCalledWith("all");
  });
});
