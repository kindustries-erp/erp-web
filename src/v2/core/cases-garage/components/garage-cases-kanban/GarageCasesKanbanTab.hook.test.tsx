import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { toast } from "react-hot-toast";
import { useGarageKanbanActions } from "./GarageCasesKanbanTab.hook";
import type { GarageVehicleKanbanItem } from "../../kanban";

vi.mock("react-hot-toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const item = {
  id: "30A-1::QUOTATION",
  licensePlate: "30A-1",
} as GarageVehicleKanbanItem;
const drop = (target: string, source = "QUOTATION") => ({
  itemId: item.id,
  item,
  sourceLaneId: source,
  targetLaneId: target,
  targetIndex: 0,
});

describe("useGarageKanbanActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("kéo sang cột INTAKE gọi onMoveStatus với status v2 và báo thành công", async () => {
    const onMoveStatus = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useGarageKanbanActions({ editable: true, onMoveStatus }),
    );
    await act(() => result.current.handleCardDrop(drop("INTAKE")));
    expect(onMoveStatus).toHaveBeenCalledWith(item, "INTAKE");
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it("cột QUOTATION ánh xạ sang status QUOTED", async () => {
    const onMoveStatus = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useGarageKanbanActions({ editable: true, onMoveStatus }),
    );
    await act(() => result.current.handleCardDrop(drop("QUOTATION", "INTAKE")));
    expect(onMoveStatus).toHaveBeenCalledWith(item, "QUOTED");
  });

  it("lỗi từ API thì báo lỗi, không báo thành công", async () => {
    const onMoveStatus = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useGarageKanbanActions({ editable: true, onMoveStatus }),
    );
    await act(() => result.current.handleCardDrop(drop("COMPLETED")));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("thả về cùng cột hoặc không có quyền thì không gọi API", async () => {
    const onMoveStatus = vi.fn().mockResolvedValue(undefined);
    const same = renderHook(() =>
      useGarageKanbanActions({ editable: true, onMoveStatus }),
    );
    await act(() => same.result.current.handleCardDrop(drop("QUOTATION")));
    const denied = renderHook(() =>
      useGarageKanbanActions({ editable: false, onMoveStatus }),
    );
    await act(() => denied.result.current.handleCardDrop(drop("INTAKE")));
    expect(onMoveStatus).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("đổi công đoạn và hoàn về KGara gọi đúng callback", async () => {
    const onChangeStage = vi.fn().mockResolvedValue(undefined);
    const onRevertStatus = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useGarageKanbanActions({ editable: true, onChangeStage, onRevertStatus }),
    );
    await act(async () => result.current.handleChangeStage?.(item, "QC"));
    await act(async () => result.current.handleRevert?.(item));
    expect(onChangeStage).toHaveBeenCalledWith(item, "QC");
    expect(onRevertStatus).toHaveBeenCalledWith(item);
    expect(toast.success).toHaveBeenCalledTimes(2);
  });
});
