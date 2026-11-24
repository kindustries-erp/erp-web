import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";
import { useWorkshopStatusChange } from "./useWorkshopStatusChange";

const item = {
  id: "c1",
  status: "QUOTED",
  origin: "NATIVE",
} as CaseWorkshopBoardItem;

describe("useWorkshopStatusChange", () => {
  it("đổi thường gọi ngay; Hủy chờ xác nhận, bỏ qua thì không gọi", () => {
    const move = vi.fn();
    const { result } = renderHook(() => useWorkshopStatusChange(move));
    act(() => result.current.request(item, "IN_PROGRESS"));
    expect(move).toHaveBeenCalledWith(item, "IN_PROGRESS");
    act(() => result.current.request(item, "CANCELLED"));
    expect(move).toHaveBeenCalledTimes(1);
    expect(result.current.cancelTarget).toBe(item);
    act(() => result.current.dismissCancel());
    expect(result.current.cancelTarget).toBeNull();
    act(() => result.current.request(item, "CANCELLED"));
    act(() => result.current.confirmCancel());
    expect(move).toHaveBeenLastCalledWith(item, "CANCELLED");
    expect(result.current.cancelTarget).toBeNull();
  });

  it("kéo sai bảng chuyển báo toast, không gọi đổi trạng thái", () => {
    const move = vi.fn();
    const showToast = vi.spyOn(useV2ToastStore.getState(), "showToast");
    const { result } = renderHook(() => useWorkshopStatusChange(move));
    act(() => result.current.invalid(item, "INTAKE"));
    expect(move).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
  });
});
