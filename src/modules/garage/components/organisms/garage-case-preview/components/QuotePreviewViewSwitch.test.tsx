import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuotePreviewViewSwitch } from "./QuotePreviewViewSwitch";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def?: string) => def || _key,
  }),
}));

describe("QuotePreviewViewSwitch", () => {
  it("renders correctly with DOCUMENT mode", () => {
    const onChange = vi.fn();
    render(
      <QuotePreviewViewSwitch
        viewMode="DOCUMENT"
        onViewModeChange={onChange}
      />,
    );

    const docBtn = screen.getByText("Bản in");
    const tableBtn = screen.getByText("Bảng dữ liệu");

    expect(docBtn).toBeInTheDocument();
    expect(tableBtn).toBeInTheDocument();

    fireEvent.click(tableBtn);
    expect(onChange).toHaveBeenCalledWith("TABLE");
  });

  it("handles clicking DOCUMENT when in TABLE mode", () => {
    const onChange = vi.fn();
    render(
      <QuotePreviewViewSwitch viewMode="TABLE" onViewModeChange={onChange} />,
    );

    const docBtn = screen.getByText("Bản in");
    fireEvent.click(docBtn);
    expect(onChange).toHaveBeenCalledWith("DOCUMENT");
  });
});
