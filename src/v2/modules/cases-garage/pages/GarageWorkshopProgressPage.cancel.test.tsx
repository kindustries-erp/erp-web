import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@/v2/core/cases-garage";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";
import { GarageWorkshopCancelConfirm } from "./GarageWorkshopProgressPage.cancel";

describe("GarageWorkshopCancelConfirm", () => {
  it("hỏi Hủy xe theo biển số; xác nhận / quay lại gọi đúng hàm", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <GarageWorkshopCancelConfirm
        target={
          {
            id: "c1",
            licensePlate: "51A-123",
            caseCode: "VV1",
          } as CaseWorkshopBoardItem
        }
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByText("Hủy xe 51A-123?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy xe" }));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("không có xe thì không mở", () => {
    render(
      <GarageWorkshopCancelConfirm
        target={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Hủy xe/)).toBeNull();
  });
});
