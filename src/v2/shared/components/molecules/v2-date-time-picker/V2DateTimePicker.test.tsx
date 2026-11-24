import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2DateTimePicker } from "./V2DateTimePicker";

describe("V2DateTimePicker", () => {
  it("hiện ngày và giờ; đổi giờ giữ ngày", () => {
    const onValueChange = vi.fn();
    render(
      <V2DateTimePicker
        aria-label="Bắt đầu lúc"
        value="2026-11-24T08:30"
        onValueChange={onValueChange}
      />,
    );
    const time = screen.getByLabelText("Bắt đầu lúc – Giờ");
    expect(time).toHaveValue("08:30");
    fireEvent.change(time, { target: { value: "09:15" } });
    expect(onValueChange).toHaveBeenCalledWith("2026-11-24T09:15");
  });

  it("nút chọn nhanh trả thời điểm lùi tương ứng", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 24, 10, 0));
    const onValueChange = vi.fn();
    render(
      <V2DateTimePicker
        aria-label="Bắt đầu lúc"
        value=""
        onValueChange={onValueChange}
        quickMinutesAgo={[0, 30, 60]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "30 phút trước" }));
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-24T09:30");
    fireEvent.click(screen.getByRole("button", { name: "1 giờ trước" }));
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-24T09:00");
    fireEvent.click(screen.getByRole("button", { name: "Bây giờ" }));
    expect(onValueChange).toHaveBeenLastCalledWith("2026-11-24T10:00");
    vi.useRealTimers();
  });
});
