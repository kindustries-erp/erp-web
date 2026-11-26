import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GarageVehicleKanbanCard } from "./GarageVehicleKanbanCard";
import { groupCasesByVehicle } from "../../kanban";
import { mockCases } from "../../kanban/garageCaseKanban.fixtures";

const base = groupCasesByVehicle([mockCases[0]], {
  "1": {
    status: "IN_PROGRESS",
    progressStage: "PAINTING",
    statusOverridden: true,
  },
})[0];

describe("GarageVehicleKanbanCard", () => {
  it("cột Đang làm hiện badge công đoạn và dấu đã chỉnh ở v2", () => {
    render(<GarageVehicleKanbanCard item={base} laneId="IN_PROGRESS" />);
    expect(screen.getByText("Sơn")).toBeInTheDocument();
    expect(screen.getByText("Đã chỉnh ở v2")).toBeInTheDocument();
  });

  it("cột khác không hiện badge công đoạn", () => {
    render(
      <GarageVehicleKanbanCard
        item={{ ...base, statusOverridden: false }}
        laneId="QUOTATION"
      />,
    );
    expect(screen.queryByText("Sơn")).not.toBeInTheDocument();
  });

  it("có quyền: chọn công đoạn mới gọi onChangeStage, bấm hoàn về gọi onRevertStatus", () => {
    const onChangeStage = vi.fn();
    const onRevertStatus = vi.fn();
    render(
      <GarageVehicleKanbanCard
        item={base}
        laneId="IN_PROGRESS"
        canEdit
        onChangeStage={onChangeStage}
        onRevertStatus={onRevertStatus}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sơn" }));
    fireEvent.click(screen.getByText("Kiểm tra chất lượng"));
    expect(onChangeStage).toHaveBeenCalledWith(base, "QC");

    fireEvent.click(
      screen.getByRole("button", { name: "Về trạng thái KGara" }),
    );
    expect(onRevertStatus).toHaveBeenCalledWith(base);
  });

  it("không có quyền: không có nút hoàn về và badge không mở danh sách", () => {
    render(<GarageVehicleKanbanCard item={base} laneId="IN_PROGRESS" />);
    expect(
      screen.queryByRole("button", { name: "Về trạng thái KGara" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sơn" }),
    ).not.toBeInTheDocument();
  });
});
