import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GarageCaseStatusTabs } from "./GarageCaseStatusTabs";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, def: string) => def,
  }),
}));

describe("GarageCaseStatusTabs", () => {
  it("renders all status tabs correctly", () => {
    const onChange = vi.fn();
    render(<GarageCaseStatusTabs value="all" onChange={onChange} />);

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Báo giá")).toBeInTheDocument();
    expect(screen.getByText("Đang làm")).toBeInTheDocument();
    expect(screen.getByText("Kết thúc")).toBeInTheDocument();
  });

  it("calls onChange when a tab is clicked", () => {
    const onChange = vi.fn();
    render(<GarageCaseStatusTabs value="all" onChange={onChange} />);

    fireEvent.click(screen.getByText("Báo giá"));
    expect(onChange).toHaveBeenCalledWith("quotation");
  });
});
