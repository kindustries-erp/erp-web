import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2TimePicker } from "./V2TimePicker";

const viewport = (isMobile: boolean) =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: isMobile ? 390 : 1280,
    height: 800,
    isMobile,
    isTablet: false,
    isDesktop: !isMobile,
  });

const pick = (list: string, value: string) =>
  fireEvent.click(
    within(screen.getByRole("listbox", { name: list })).getByRole("option", {
      name: value,
    }),
  );

describe("V2TimePicker", () => {
  beforeEach(() => viewport(false));
  afterEach(() => vi.restoreAllMocks());

  it("hiện giờ đang chọn hoặc gợi ý trên nút", () => {
    const { rerender } = render(
      <V2TimePicker value="" onValueChange={vi.fn()} aria-label="Giờ" />,
    );
    expect(screen.getByRole("button", { name: "Giờ" })).toHaveTextContent(
      "Chọn giờ",
    );
    rerender(
      <V2TimePicker value="08:30" onValueChange={vi.fn()} aria-label="Giờ" />,
    );
    expect(screen.getByRole("button", { name: "Giờ" })).toHaveTextContent(
      "08:30",
    );
  });

  it("chọn giờ giữ phút và panel mở; chọn phút thì đóng", () => {
    const onValueChange = vi.fn();
    render(
      <V2TimePicker
        value="08:30"
        onValueChange={onValueChange}
        aria-label="Giờ"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Giờ" }));
    pick("Giờ", "09");
    expect(onValueChange).toHaveBeenLastCalledWith("09:30");
    expect(screen.getByRole("listbox", { name: "Phút" })).toBeInTheDocument();
    pick("Phút", "45");
    expect(onValueChange).toHaveBeenLastCalledWith("08:45");
    expect(screen.queryByRole("listbox", { name: "Phút" })).toBeNull();
  });

  it("maxTime khóa giờ/phút sau mốc; phút lệch bước vẫn có trong danh sách", () => {
    render(
      <V2TimePicker
        value="10:07"
        onValueChange={vi.fn()}
        maxTime="10:20"
        aria-label="Giờ"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Giờ" }));
    const hours = within(screen.getByRole("listbox", { name: "Giờ" }));
    expect(hours.getByRole("option", { name: "11" })).toBeDisabled();
    expect(hours.getByRole("option", { name: "10" })).toBeEnabled();
    const minutes = within(screen.getByRole("listbox", { name: "Phút" }));
    expect(minutes.getByRole("option", { name: "07" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(minutes.getByRole("option", { name: "25" })).toBeDisabled();
  });

  it("mobile mở bottom sheet", () => {
    vi.restoreAllMocks();
    viewport(true);
    const onValueChange = vi.fn();
    render(
      <V2TimePicker
        value="08:30"
        onValueChange={onValueChange}
        aria-label="Giờ"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Giờ" }));
    pick("Phút", "15");
    expect(onValueChange).toHaveBeenCalledWith("08:15");
  });
});
