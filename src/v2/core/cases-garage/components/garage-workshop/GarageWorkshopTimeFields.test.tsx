import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GarageWorkshopTimeFields } from "./GarageWorkshopTimeFields";

describe("GarageWorkshopTimeFields", () => {
  it("dùng V2DateTimePicker: đổi giờ, chọn nhanh; chỉ hiện Kết thúc lúc khi cần", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 24, 10, 0));
    const onChange = vi.fn();
    const { rerender } = render(
      <GarageWorkshopTimeFields
        startedAt="2026-11-24T08:00"
        endedAt=""
        showEnd={false}
        showHint
        onChange={onChange}
      />,
    );
    expect(document.querySelector('input[type="datetime-local"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu lúc – Giờ" }));
    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Phút" })).getByRole(
        "option",
        { name: "20" },
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      startedAt: "2026-11-24T08:20",
    });
    fireEvent.click(screen.getByRole("button", { name: "30 phút trước" }));
    expect(onChange).toHaveBeenLastCalledWith({
      startedAt: "2026-11-24T09:30",
    });
    expect(screen.queryByLabelText("Kết thúc lúc – Giờ")).toBeNull();
    rerender(
      <GarageWorkshopTimeFields
        startedAt="2026-11-24T08:00"
        endedAt="2026-11-24T09:00"
        showEnd
        showHint={false}
        onChange={onChange}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Kết thúc lúc – Giờ" }),
    ).toHaveTextContent("09:00");
    vi.useRealTimers();
  });
});
