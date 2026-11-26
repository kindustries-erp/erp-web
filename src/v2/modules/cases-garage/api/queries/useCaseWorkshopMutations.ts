import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { CaseProgressStatus } from "../../domain/caseProgress.type";
import type {
  CaseWorkshopBoardResponse,
  CreateCaseProgressLogPayload,
  TrackNewWorkshopCasePayload,
  TrackWorkshopCasePayload,
  UpdateCaseProgressLogPayload,
} from "../../domain/caseWorkshop.type";
import { caseProgressApi } from "../caseProgressApi";
import { caseWorkshopApi } from "../caseWorkshopApi";
import { caseProgressKeys } from "./caseProgressKeys";
import { caseWorkshopKeys } from "./caseWorkshopKeys";
import { casesDashboardKeys } from "./casesDashboardKeys";

type Snapshot = [readonly unknown[], CaseWorkshopBoardResponse | undefined][];

/** Đổi status lạc quan trên mọi board đang cache: thẻ sang cột mới, bỏ status nhỏ và công đoạn mở. */
async function moveOnBoards(
  client: QueryClient,
  id: string,
  status: CaseProgressStatus,
): Promise<Snapshot> {
  await client.cancelQueries({ queryKey: caseWorkshopKeys.boards() });
  const snapshot = client.getQueriesData<CaseWorkshopBoardResponse>({
    queryKey: caseWorkshopKeys.boards(),
  }) as Snapshot;
  client.setQueriesData<CaseWorkshopBoardResponse>(
    { queryKey: caseWorkshopKeys.boards() },
    (old) =>
      old && {
        ...old,
        items: old.items.map((it) =>
          it.id === id
            ? {
                ...it,
                status,
                progressStage: null,
                stageStartedAt: null,
                stageElapsedMinutes: null,
                stageWorkerName: null,
              }
            : it,
        ),
      },
  );
  return snapshot;
}

/**
 * Lệnh ghi của trang tiến độ xưởng. Đổi status cha cập nhật lạc quan và hoàn lại khi lỗi;
 * mọi lệnh xong đều tải lại board, timeline, Kanban cũ và dashboard.
 * `createBranchId`: chi nhánh gắn cho xe tạo mới (mặc định `branchId`), để xe tạo khi xem mọi chi nhánh
 * vẫn thuộc chi nhánh đang chọn ở shell.
 */
export function useCaseWorkshopMutations(
  branchId?: string,
  createBranchId: string | undefined = branchId,
) {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: caseWorkshopKeys.all });
    void client.invalidateQueries({ queryKey: caseProgressKeys.all });
    void client.invalidateQueries({ queryKey: casesDashboardKeys.all });
  };

  const moveStatus = useMutation({
    mutationFn: (v: { id: string; status: CaseProgressStatus }) =>
      caseProgressApi.updateStatus(v.id, v.status, branchId),
    onMutate: (v) => moveOnBoards(client, v.id, v.status),
    onError: (_e, _v, snapshot) =>
      snapshot?.forEach(([key, data]) => client.setQueryData(key, data)),
    onSettled: refresh,
  });

  const createLog = useMutation({
    mutationFn: (v: {
      caseId: string;
      payload: CreateCaseProgressLogPayload;
    }) => caseWorkshopApi.createLog(v.caseId, v.payload, branchId),
    onSettled: refresh,
  });

  const updateLog = useMutation({
    mutationFn: (v: { logId: string; payload: UpdateCaseProgressLogPayload }) =>
      caseWorkshopApi.updateLog(v.logId, v.payload, branchId),
    onSettled: refresh,
  });

  const removeLog = useMutation({
    mutationFn: (logId: string) => caseWorkshopApi.removeLog(logId, branchId),
    onSettled: refresh,
  });

  const track = useMutation({
    mutationFn: (payload: TrackWorkshopCasePayload) =>
      caseWorkshopApi.track(payload, branchId),
    onSettled: refresh,
  });

  const trackNew = useMutation({
    mutationFn: (payload: TrackNewWorkshopCasePayload) =>
      caseWorkshopApi.trackNew(payload, createBranchId),
    onSettled: refresh,
  });

  /** Bỏ khỏi bảng: gỡ thẻ ngay trên cache, hoàn lại khi lỗi. */
  const untrack = useMutation({
    mutationFn: (caseId: string) => caseWorkshopApi.untrack(caseId, branchId),
    onMutate: async (caseId) => {
      await client.cancelQueries({ queryKey: caseWorkshopKeys.boards() });
      const snapshot = client.getQueriesData<CaseWorkshopBoardResponse>({
        queryKey: caseWorkshopKeys.boards(),
      }) as Snapshot;
      client.setQueriesData<CaseWorkshopBoardResponse>(
        { queryKey: caseWorkshopKeys.boards() },
        (old) =>
          old && { ...old, items: old.items.filter((it) => it.id !== caseId) },
      );
      return snapshot;
    },
    onError: (_e, _v, snapshot) =>
      snapshot?.forEach(([key, data]) => client.setQueryData(key, data)),
    onSettled: refresh,
  });

  return {
    moveStatus,
    createLog,
    updateLog,
    removeLog,
    track,
    trackNew,
    untrack,
  };
}
