import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";
// Nạp locale họ garage (hook chỉ import type từ core).
import "@/v2/core/cases-garage";
import { useGarageWorkshopTracking } from "./useGarageWorkshopTracking";

const track = vi.fn();
const trackNew = vi.fn();
const untrack = vi.fn();
const candidatesQuery = vi.fn();

vi.mock("../api/queries/useCaseWorkshopQueries", () => ({
  useWorkshopCandidatesQuery: (...a: unknown[]) => {
    candidatesQuery(...a);
    return { data: [{ id: "k1" }], isFetching: false };
  },
}));
vi.mock("../api/queries/useCaseWorkshopMutations", () => ({
  useCaseWorkshopMutations: () => ({
    track: { mutateAsync: track, isPending: false },
    trackNew: { mutateAsync: trackNew, isPending: false },
    untrack: { mutateAsync: untrack },
  }),
}));

const setPermissions = (perms: { collection: string; actions: string[] }[]) =>
  useAuthStore.setState({ effectivePermissions: perms } as never);
const lastToast = () => useV2ToastStore.getState().toasts.slice(-1)[0];
const item = {
  id: "c1",
  caseCode: "VV-1",
  licensePlate: "51A-1",
} as CaseWorkshopBoardItem;

describe("useGarageWorkshopTracking", () => {
  beforeEach(() => {
    track.mockReset().mockResolvedValue({
      caseId: "c1",
      caseCode: "VV-1",
      licensePlate: "51A-1",
    });
    trackNew.mockReset().mockResolvedValue({
      caseId: "n1",
      caseCode: "VV-2",
      licensePlate: "30A-1",
    });
    untrack.mockReset().mockResolvedValue(undefined);
    candidatesQuery.mockReset();
    useV2ToastStore.setState({ toasts: [] });
    setPermissions([
      { collection: "garage_workshop", actions: ["read", "update"] },
      { collection: "garage", actions: ["create"] },
    ]);
  });

  it("quyền: thêm cần garage_workshop:update và chi nhánh; tạo mới theo garage:create", () => {
    const { result } = renderHook(() => useGarageWorkshopTracking("KG1"));
    expect(result.current.canAdd).toBe(true);
    expect(result.current.canCreate).toBe(true);
    expect(result.current.canChangeStatus).toBe(false);
    const none = renderHook(() => useGarageWorkshopTracking(undefined));
    expect(none.result.current.canAdd).toBe(false);
  });

  it("chỉ tìm ứng viên khi hộp thoại mở", () => {
    const { result } = renderHook(() => useGarageWorkshopTracking("KG1"));
    expect(candidatesQuery).toHaveBeenLastCalledWith("", "KG1", false);
    act(() => result.current.openAdd());
    act(() => result.current.setSearch("51A"));
    expect(candidatesQuery).toHaveBeenLastCalledWith("51A", "KG1", true);
  });

  it("đưa xe có sẵn và xe mới vào bảng, báo thành công và mở xe vừa thêm", async () => {
    const onTracked = vi.fn();
    const { result } = renderHook(() =>
      useGarageWorkshopTracking("KG1", onTracked),
    );
    await act(() =>
      result.current.submit({
        mode: "existing",
        caseId: "c1",
        status: "IN_PROGRESS",
      }),
    );
    expect(track).toHaveBeenCalledWith({ caseId: "c1", status: "IN_PROGRESS" });
    expect(lastToast()?.title).toBe("Đã đưa xe 51A-1 vào bảng");
    await act(() =>
      result.current.submit({
        mode: "new",
        licensePlate: "30A-1",
        status: "INTAKE",
      }),
    );
    expect(trackNew).toHaveBeenCalledWith({
      licensePlate: "30A-1",
      customerName: undefined,
      status: "INTAKE",
    });
    expect(onTracked).toHaveBeenLastCalledWith("n1");
  });

  it("lỗi khi thêm: báo lỗi và ném lại để hộp thoại giữ nguyên", async () => {
    track.mockRejectedValue(new Error("409"));
    const { result } = renderHook(() => useGarageWorkshopTracking("KG1"));
    await expect(
      act(() => result.current.submit({ mode: "existing", caseId: "c1" })),
    ).rejects.toThrow("409");
    expect(lastToast()?.variant).toBe("destructive");
  });

  it("bỏ khỏi bảng qua xác nhận", async () => {
    const { result } = renderHook(() => useGarageWorkshopTracking("KG1"));
    act(() => result.current.askUntrack(item));
    expect(result.current.untrackTarget).toBe(item);
    await act(() => result.current.confirmUntrack());
    expect(untrack).toHaveBeenCalledWith("c1");
    expect(result.current.untrackTarget).toBeNull();
    expect(lastToast()?.title).toBe("Đã bỏ xe 51A-1 khỏi bảng");
  });
});
