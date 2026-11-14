import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "../../../deckViewer.locale";
import { V2DeckThumbnailCard } from "./V2DeckThumbnailCard";
import type { DeckSlide } from "../../../types/deckViewer.type";

const sampleSlide: DeckSlide = {
  pageNumber: 3,
  title: "Phân tích doanh thu và chi phí",
  subtitle: "Tài chính",
  theme: "light",
};

describe("V2DeckThumbnailCard", () => {
  it("renders slide page number and title using V2 atoms", () => {
    render(
      <V2DeckThumbnailCard
        slide={sampleSlide}
        isActive={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
      screen.getAllByText("Phân tích doanh thu và chi phí").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tài chính")).toBeInTheDocument();
  });

  it("sets aria-current='page' when active and localized aria-label", () => {
    render(
      <V2DeckThumbnailCard
        slide={sampleSlide}
        isActive={true}
        onSelect={vi.fn()}
      />,
    );

    const btn = screen.getByRole("button", {
      name: "Trang 3: Phân tích doanh thu và chi phí",
    });
    expect(btn).toHaveAttribute("aria-current", "page");
  });

  it("calls onSelect with pageNumber when clicked", () => {
    const onSelect = vi.fn();
    render(
      <V2DeckThumbnailCard
        slide={sampleSlide}
        isActive={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
