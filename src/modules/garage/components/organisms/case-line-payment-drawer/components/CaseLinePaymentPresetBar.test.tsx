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

  it("handles switching to other presets cleanly", () => {
    const onSelectPreset = vi.fn();
    render(
      <CaseLinePaymentPresetBar
        viewPreset="all"
        onSelectPreset={onSelectPreset}
        totalCount={10}
        suggestionsCount={4}
        selectedCount={2}
        linkedCount={1}
      />,
    );

    fireEvent.click(screen.getByText("Đang chọn"));
    expect(onSelectPreset).toHaveBeenCalledWith("selected");

    fireEvent.click(screen.getByText("Đã cấn trừ"));
    expect(onSelectPreset).toHaveBeenCalledWith("linked");
  });
});
