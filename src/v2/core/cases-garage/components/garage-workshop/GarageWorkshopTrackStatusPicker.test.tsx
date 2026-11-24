import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GarageWorkshopTrackStatusPicker } from "./GarageWorkshopTrackStatusPicker";

describe("GarageWorkshopTrackStatusPicker", () => {
  it("khóa trạng thái không được phép, đánh dấu Hiện tại, báo khi chọn", () => {
    const onChange = vi.fn();
    render(
      <GarageWorkshopTrackStatusPicker
        value="QUOTED"
        current="QUOTED"
        allowed={new Set(["QUOTED", "IN_PROGRESS"])}
        helperText="Gợi ý"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("radio", { name: /Báo giá/ })).toBeChecked();
    expect(screen.getByText("Hiện tại")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Hoàn thành/ })).toBeDisabled();
    expect(screen.getByText("Gợi ý")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Đang làm/ }));
    expect(onChange).toHaveBeenCalledWith("IN_PROGRESS");
  });
});
