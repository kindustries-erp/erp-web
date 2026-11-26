import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type {
  CaseProgressItem,
  CaseProgressListResponse,
  CaseProgressStatus,
  UpdateCaseProgressPayload,
} from "../../domain/caseProgress.type";
import { casesDashboardKeys } from "./casesDashboardKeys";
import { caseProgressApi } from "../caseProgressApi";
import { caseProgressKeys } from "./caseProgressKeys";

/** Cache gồm danh sách phân trang (`list`) và mảng đủ trang (`listAll`) dưới cùng tiền tố khóa. */
type CachedProgress = CaseProgressListResponse | CaseProgressItem[];
type Snapshot = [readonly unknown[], CachedProgress | undefined][];

function patchItems(
  items: CaseProgressItem[],
  id: string,
  patch: Partial<CaseProgressItem>,
): CaseProgressItem[] {
  return items.map((it) => (it.id === id ? { ...it, ...patch } : it));
}

/** Áp thay đổi lên mọi danh sách tiến độ đang cache và trả bản chụp cũ để hoàn lại khi lỗi. */
async function patchCachedItem(
  client: QueryClient,
  id: string,
  patch: Partial<CaseProgressItem>,
): Promise<Snapshot> {
  await client.cancelQueries({ queryKey: caseProgressKeys.all });
  const snapshot = client.getQueriesData<CachedProgress>({
    queryKey: caseProgressKeys.all,
  }) as Snapshot;
  client.setQueriesData<CachedProgress>(
    { queryKey: caseProgressKeys.all },
    (old) => {
      if (!old) return old;
      if (Array.isArray(old)) return patchItems(old, id, patch);
      return { ...old, items: patchItems(old.items, id, patch) };
    },
  );
  return snapshot;
}

function rollback(client: QueryClient, snapshot?: Snapshot) {
  snapshot?.forEach(([key, data]) => client.setQueryData(key, data));
}

/**
 * Ba thao tác ghi của Kanban: đổi trạng thái (kéo thả), đổi công đoạn (badge), về giá trị KGara.
 * Đổi trạng thái và công đoạn cập nhật lạc quan, lỗi thì hoàn lại; xong luôn tải lại danh sách và dashboard.
 */
export function useCaseProgressMutations(branchId?: string) {
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: caseProgressKeys.all });
    void client.invalidateQueries({ queryKey: casesDashboardKeys.all });
  };

  const updateStatus = useMutation({
    mutationFn: (v: { id: string; status: CaseProgressStatus }) =>
      caseProgressApi.updateStatus(v.id, v.status, branchId),
    onMutate: (v) => patchCachedItem(client, v.id, { status: v.status }),
    onError: (_e, _v, snapshot) => rollback(client, snapshot),
    onSettled: refresh,
  });

  const updateProgress = useMutation({
    mutationFn: (v: { id: string; payload: UpdateCaseProgressPayload }) =>
      caseProgressApi.updateProgress(v.id, v.payload, branchId),
    onMutate: (v) =>
      patchCachedItem(
        client,
        v.id,
        v.payload.progressStage !== undefined
          ? { progressStage: v.payload.progressStage }
          : {},
      ),
    onError: (_e, _v, snapshot) => rollback(client, snapshot),
    onSettled: refresh,
  });

  /** Không cập nhật lạc quan vì giá trị KGara chỉ backend biết; tải lại sau khi xong. */
  const revert = useMutation({
    mutationFn: (v: { id: string; fields?: string[] }) =>
      caseProgressApi.revert(v.id, v.fields, branchId),
    onSettled: refresh,
  });

  return { updateStatus, updateProgress, revert };
}
