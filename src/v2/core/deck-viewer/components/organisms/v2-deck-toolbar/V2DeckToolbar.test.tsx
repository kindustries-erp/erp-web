import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "../../../deckViewer.locale";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { V2DeckToolbar } from "./V2DeckToolbar";

const baseProps = {
  title: "Báo cáo tài chính",
  subtitle: "25/09/2026",
  currentPage: 2,
  totalPages: 16,
  isSidebarOpen: true,
  isFullscreen: false,
  onToggleSidebar: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onDownloadPdf: vi.fn(),
  onToggleFullscreen: vi.fn(),
};

describe("V2DeckToolbar", () => {
  afterEach(() => {
    cleanup();
    useV2LocaleStore.setState({ locale: "vi" });
  });

  it("renders title, subtitle, page counter and language switcher", () => {
    useV2LocaleStore.setState({ locale: "vi" });
    render(<V2DeckToolbar {...baseProps} />);

    expect(screen.getByText("Báo cáo tài chính")).toBeInTheDocument();
    expect(screen.getByText("25/09/2026")).toBeInTheDocument();
    expect(screen.getByText("2 / 16")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "VI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });

  it("triggers downloadPdf, prev, next and sidebar toggle callbacks", () => {
    useV2LocaleStore.setState({ locale: "vi" });
    const onDownloadPdf = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onToggleSidebar = vi.fn();

    render(
      <V2DeckToolbar
        {...baseProps}
        onDownloadPdf={onDownloadPdf}
        onPrev={onPrev}
        onNext={onNext}
        onToggleSidebar={onToggleSidebar}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Tải PDF" }));
    expect(onDownloadPdf).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Trang trước" }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Trang tiếp theo" }));
    expect(onNext).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Đóng/mở danh sách trang" }),
    );
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("switches UI translations when locale changes to en", () => {
    useV2LocaleStore.setState({ locale: "en" });
    render(<V2DeckToolbar {...baseProps} />);

    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next page" }),
    ).toBeInTheDocument();
  });

  it("disables prev button on first page and next button on last page", () => {
    useV2LocaleStore.setState({ locale: "vi" });
    const { rerender } = render(
      <V2DeckToolbar {...baseProps} currentPage={1} />,
    );
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Trang tiếp theo" }),
    ).not.toBeDisabled();

    rerender(<V2DeckToolbar {...baseProps} currentPage={16} />);
    expect(
      screen.getByRole("button", { name: "Trang trước" }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Trang tiếp theo" }),
    ).toBeDisabled();
  });
});
