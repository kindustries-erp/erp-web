import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2TableText } from "./V2TableText";

describe("V2TableText", () => {
  beforeEach(() => {
    useAppStore.setState({ locale: "vi" });
    vi.spyOn(viewportHook, "useViewport").mockReturnValue({
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders the text without optional controls by default", () => {
    render(<V2TableText text="HD-001" />);
    expect(screen.getByText("HD-001")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("opens the detail without bubbling to the row", () => {
    const onDetailClick = vi.fn();
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <V2TableText text="HD-001" onDetailClick={onDetailClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    expect(onDetailClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("bấm vào text thì mở chi tiết (dạng link), không lan lên dòng", () => {
    const onTextClick = vi.fn();
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <V2TableText text="HD-001" onTextClick={onTextClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "HD-001" }));
    expect(onTextClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("không có onTextClick thì text vẫn là chữ thường, không phải nút", () => {
    render(<V2TableText text="HD-001" />);
    expect(screen.queryByRole("button", { name: "HD-001" })).toBeNull();
  });

  it("opens the linked record from the drawer icon", () => {
    const onDrawerClick = vi.fn();
    render(<V2TableText text="KH-9" onDrawerClick={onDrawerClick} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Mở bản ghi liên kết" }),
    );
    expect(onDrawerClick).toHaveBeenCalledTimes(1);
  });

  it("copies the text and shows feedback that resets", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<V2TableText text="HD-001" enableCopy />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sao chép" }));
    });
    expect(writeText).toHaveBeenCalledWith("HD-001");
    expect(
      screen.getByRole("button", { name: "Đã sao chép" }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(
      screen.getByRole("button", { name: "Sao chép" }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not crash when the clipboard API is unavailable", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    render(<V2TableText text="HD-001" enableCopy />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Sao chép" })),
    ).not.toThrow();
  });
});
