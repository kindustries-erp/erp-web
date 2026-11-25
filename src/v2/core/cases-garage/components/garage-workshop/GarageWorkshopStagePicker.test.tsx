import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GarageWorkshopStagePicker } from "./GarageWorkshopStagePicker";

describe("GarageWorkshopStagePicker", () => {
  it("combobox hiện công đoạn đang chọn; mở danh sách và chọn công đoạn khác", () => {
    const onChange = vi.fn();
    render(
      <GarageWorkshopStagePicker
        stages={["WAITING_PARTS", "PAINTING"]}
        value="PAINTING"
        onChange={onChange}
      />,
    );
    const box = screen.getByRole("combobox", { name: "Công đoạn" });
    expect(box).toHaveTextContent("Sơn");
    fireEvent.click(box);
    fireEvent.click(screen.getByRole("option", { name: /Chờ phụ tùng/ }));
    expect(onChange).toHaveBeenCalledWith("WAITING_PARTS");
  });

  it("chưa chọn thì hiện gợi ý chọn công đoạn", () => {
    render(
      <GarageWorkshopStagePicker
        stages={["PAINTING"]}
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "Công đoạn" }),
    ).toHaveTextContent("Chọn công đoạn");
  });
});
