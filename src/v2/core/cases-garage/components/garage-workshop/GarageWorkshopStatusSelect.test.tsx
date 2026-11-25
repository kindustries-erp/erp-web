import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GarageWorkshopStatusSelect } from "./GarageWorkshopStatusSelect";

const box = () => screen.getByRole("combobox", { name: "Trạng thái" });

describe("GarageWorkshopStatusSelect", () => {
  it("xe ERP Báo giá: chọn được Hủy, khóa Tiếp nhận/Hoàn thành", () => {
    const onChange = vi.fn();
    render(
      <GarageWorkshopStatusSelect
        status="QUOTED"
        origin="NATIVE"
        canChangeStatus
        onChange={onChange}
      />,
    );
    expect(box()).toHaveTextContent("Báo giá");
    fireEvent.click(box());
    expect(screen.getByRole("option", { name: /Hoàn thành/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("option", { name: /Tiếp nhận/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    fireEvent.click(screen.getByRole("option", { name: /Hủy/ }));
    expect(onChange).toHaveBeenCalledWith("CANCELLED");
  });

  it("xe KGara: gợi ý chỉ đổi trên ERP; không có quyền thì khóa ô", () => {
    const { rerender } = render(
      <GarageWorkshopStatusSelect
        status="QUOTED"
        origin="KGARA_SYNC"
        canChangeStatus
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/KGara giữ nguyên/)).toBeInTheDocument();
    rerender(
      <GarageWorkshopStatusSelect
        status="QUOTED"
        origin="KGARA_SYNC"
        canChangeStatus={false}
        onChange={vi.fn()}
      />,
    );
    expect(box()).toBeDisabled();
  });
});
