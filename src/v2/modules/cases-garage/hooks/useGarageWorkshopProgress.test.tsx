import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";
import { useGarageWorkshopProgress } from "./useGarageWorkshopProgress";

const mutateMove = vi.fn();
const boardQuery = vi.fn();
const mutateCreate = vi.fn();
const item = (over: Partial<CaseWorkshopBoardItem>) =>
  ({
    id: "c1",
    caseCode: "VV-1",
    licensePlate: "51A-1",
    status: "IN_PROGRESS",
    ...over,
  }) as CaseWorkshopBoardItem;

let boardItems: CaseWorkshopBoardItem[] | null = null;
vi.mock("../api/queries/useCaseWorkshopQueries", () => ({
  useCaseWorkshopBoardQuery: (...args: unknown[]) => {
    boardQuery(...args);
    return {
      data: {
        items: boardItems ?? [
          item({}),
          item({ id: "c2", licensePlate: "29C-9", customerName: "Bình" }),
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useCaseWorkshopTimelineQuery: () => ({ data: [], isLoading: false }),
  useWorkshopWorkersQuery: () => ({ data: [], isFetching: false }),
}));
vi.mock("../api/queries/useCaseWorkshopMutations", () => ({
  useCaseWorkshopMutations: () => ({
    moveStatus: { mutateAsync: mutateMove },
    createLog: { mutateAsync: mutateCreate, isPending: false },
    updateLog: { mutateAsync: vi.fn(), isPending: false },
    removeLog: { mutateAsync: vi.fn() },
  }),
}));

const setPermissions = (perms: { collection: string; actions: string[] }[]) =>
  useAuthStore.setState({ effectivePermissions: perms } as never);
const lastToast = () => useV2ToastStore.getState().toasts.slice(-1)[0];

describe("useGarageWorkshopProgress", () => {
  beforeEach(() => {
    mutateMove.mockReset().mockResolvedValue({});
    mutateCreate.mockReset().mockResolvedValue({});
    useV2ToastStore.setState({ toasts: [] });
    boardItems = null;
  });

  it("không có quyền garage:update thì không đổi status, báo lỗi quyền", () => {
    setPermissions([
      { collection: "garage_workshop", actions: ["read", "update"] },
    ]);
    const { result } = renderHook(() => useGarageWorkshopProgress("KG1"));
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canMoveStatus).toBe(false);
    act(() => result.current.moveStatus(item({}), "COMPLETED"));
    expect(mutateMove).not.toHaveBeenCalled();
    expect(lastToast()?.variant).toBe("destructive");
  });

  it("có quyền thì đổi status và báo thành công", async () => {
    setPermissions([{ collection: "garage", actions: ["update"] }]);
    const { result } = renderHook(() => useGarageWorkshopProgress("KG1"));
    expect(result.current.canEdit).toBe(false);
    act(() => result.current.moveStatus(item({}), "COMPLETED"));
    expect(mutateMove).toHaveBeenCalledWith({ id: "c1", status: "COMPLETED" });
    await waitFor(() => expect(lastToast()?.variant).toBe("success"));
  });

  it("tìm kiếm lọc theo khách; mở xe rồi ghi tiến độ gửi payload đã chuẩn hóa", async () => {
    setPermissions([{ collection: "*", actions: ["*"] }]);
    const { result } = renderHook(() => useGarageWorkshopProgress("KG1"));
    act(() => result.current.setSearch("bình"));
    expect(result.current.items.map((c) => c.id)).toEqual(["c2"]);
    act(() => result.current.open(result.current.items[0]));
    expect(result.current.selected?.id).toBe("c2");
    await act(() =>
      result.current.create({
        kind: "STAGE",
        stage: "QC",
        note: null,
        workerId: null,
        workerName: null,
      }),
    );
    expect(mutateCreate).toHaveBeenCalledWith({
      caseId: "c2",
      payload: { kind: "STAGE", stage: "QC", workerId: null, workerName: null },
    });
  });

  it("lưu lỗi thì báo lỗi và ném lại để form giữ dữ liệu", async () => {
    setPermissions([{ collection: "*", actions: ["*"] }]);
    mutateCreate.mockRejectedValue(new Error("400"));
    const { result } = renderHook(() => useGarageWorkshopProgress("KG1"));
    act(() => result.current.open(result.current.items[0]));
    await expect(
      result.current.create({
        kind: "NOTE",
        note: "x",
        workerId: null,
        workerName: null,
      }),
    ).rejects.toThrow("400");
    expect(lastToast()?.variant).toBe("destructive");
  });

  it("không có xe đang chọn: báo lỗi, không gọi API, không báo đã lưu", async () => {
    setPermissions([{ collection: "*", actions: ["*"] }]);
    const { result } = renderHook(() => useGarageWorkshopProgress("KG1"));
    await expect(
      result.current.create({
        kind: "NOTE",
        note: "x",
        workerId: null,
        workerName: null,
      }),
    ).rejects.toThrow();
    expect(mutateCreate).not.toHaveBeenCalled();
    expect(lastToast()?.variant).toBe("destructive");
  });

  it("không chọn chi nhánh vẫn lấy board (mọi chi nhánh)", () => {
    setPermissions([]);
    renderHook(() => useGarageWorkshopProgress(undefined));
    expect(boardQuery).toHaveBeenLastCalledWith(expect.anything(), undefined);
  });

  it("lọc phân loại OJ gửi classification lên board; bỏ lọc thì không gửi", () => {
    setPermissions([]);
    const { result } = renderHook(() => useGarageWorkshopProgress("B1"));
    expect(boardQuery).toHaveBeenLastCalledWith(
      { pageSize: 200, classification: undefined },
      "B1",
    );
    act(() => result.current.setClassification("OJ"));
    expect(result.current.classification).toBe("OJ");
    expect(boardQuery).toHaveBeenLastCalledWith(
      { pageSize: 200, classification: "OJ" },
      "B1",
    );
    act(() => result.current.setClassification(null));
    expect(boardQuery).toHaveBeenLastCalledWith(
      { pageSize: 200, classification: undefined },
      "B1",
    );
  });

  it("đổi phân loại hoặc phạm vi chi nhánh thì đóng xe đang mở", () => {
    setPermissions([]);
    const { result, rerender } = renderHook(
      ({ branch }: { branch?: string }) => useGarageWorkshopProgress(branch),
      { initialProps: { branch: "B1" } as { branch?: string } },
    );
    act(() => result.current.openById("c1"));
    expect(result.current.selected?.id).toBe("c1");
    act(() => result.current.setClassification("OJ"));
    expect(result.current.selected).toBeNull();
    act(() => result.current.openById("c2"));
    rerender({ branch: undefined });
    expect(result.current.selected).toBeNull();
  });

  it("board rỗng: không lọc thì boardEmpty, có lọc phân loại thì filterEmpty", () => {
    setPermissions([]);
    boardItems = [];
    const { result } = renderHook(() => useGarageWorkshopProgress("B1"));
    expect(result.current.boardEmpty).toBe(true);
    expect(result.current.filterEmpty).toBe(false);
    act(() => result.current.setClassification("OJ"));
    expect(result.current.boardEmpty).toBe(false);
    expect(result.current.filterEmpty).toBe(true);
  });
});
