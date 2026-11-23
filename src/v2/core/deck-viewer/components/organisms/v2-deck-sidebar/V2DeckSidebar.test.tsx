import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "../../../deckViewer.locale";
import { V2DeckSidebar } from "./V2DeckSidebar";
import type { DeckSlide } from "../../../types/deckViewer.type";

const slides: DeckSlide[] = [
  { pageNumber: 1, title: "Trang bìa", subtitle: "Tổng quan", theme: "dark" },
  {
    pageNumber: 2,
    title: "Báo cáo doanh thu",
    subtitle: "Tài chính",
    theme: "light",
  },
  {
    pageNumber: 3,
    title: "Kế hoạch vốn 12 tháng",
    subtitle: "Dự báo",
    theme: "light",
  },
];

describe("V2DeckSidebar", () => {
  it("renders all slide thumbnails and count heading", () => {
    render(
      <V2DeckSidebar
        slides={slides}
        currentPage={1}
        isOpen={true}
        onSelectPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Mục lục (3 trang)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Trang 1: Trang bìa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Trang 2: Báo cáo doanh thu" }),
    ).toBeInTheDocument();
  });

  it("filters slides via V2Input and shows V2EmptyState when no match", () => {
    render(
      <V2DeckSidebar
        slides={slides}
        currentPage={1}
        isOpen={true}
        onSelectPage={vi.fn()}
      />,
    );

    const searchInput = screen.getByLabelText("Tìm theo số hoặc tiêu đề...");
    fireEvent.change(searchInput, { target: { value: "doanh thu" } });

    expect(
      screen.getByRole("button", { name: "Trang 2: Báo cáo doanh thu" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Trang 1: Trang bìa" }),
    ).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "khong-ton-tai" } });
    expect(
      screen.getByText("Không tìm thấy trang phù hợp"),
    ).toBeInTheDocument();
  });

  it("returns null when closed", () => {
    const { container } = render(
      <V2DeckSidebar
        slides={slides}
        currentPage={1}
        isOpen={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
