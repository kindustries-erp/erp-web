import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopDrawerSummary } from "./GarageWorkshopDrawerSummary";

const item = workshopCaseFixture({ workSummary: "Sơn cản trước" });

describe("GarageWorkshopDrawerSummary", () => {
  it("có quyền: hiện ô Trạng thái, nội dung sửa chữa, nút Bỏ khỏi bảng", () => {
    const onUntrack = vi.fn();
    render(
      <GarageWorkshopDrawerSummary
        item={item}
        now={WORKSHOP_FIXTURE_NOW}
        canEdit
        canMoveStatus
        onChangeStatus={vi.fn()}
        onUntrack={onUntrack}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Trạng thái" })).toBeEnabled();
    expect(screen.getByText("Sơn cản trước")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Bỏ khỏi bảng/ }));
    expect(onUntrack).toHaveBeenCalled();
  });

  it("chỉ xem: không ô Trạng thái, không nút Bỏ khỏi bảng", () => {
    render(
      <GarageWorkshopDrawerSummary
        item={item}
        now={WORKSHOP_FIXTURE_NOW}
        canEdit={false}
        onUntrack={vi.fn()}
      />,
    );
    expect(screen.queryByRole("combobox", { name: "Trạng thái" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Bỏ khỏi bảng/ })).toBeNull();
  });
});
