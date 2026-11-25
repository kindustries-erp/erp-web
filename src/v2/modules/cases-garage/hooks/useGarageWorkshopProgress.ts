import * as React from "react";
import {
  filterWorkshopCases,
  useNowTick,
  type WorkshopCaseStatus,
  type WorkshopLogSubmit,
} from "@/v2/core/cases-garage";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";
import {
  toCreateLogPayload,
  toUpdateLogPayload,
} from "../domain/caseWorkshop.mapper";
import { useCaseWorkshopMutations } from "../api/queries/useCaseWorkshopMutations";
import {
  useCaseWorkshopBoardQuery,
  useCaseWorkshopTimelineQuery,
  useWorkshopWorkersQuery,
} from "../api/queries/useCaseWorkshopQueries";
import { useWorkshopDefaultWorker } from "./useWorkshopDefaultWorker";

const BOARD_PARAMS = { pageSize: 200 } as const;
const toast = (title: string, variant: "success" | "destructive") =>
  useV2ToastStore.getState().showToast({ title, variant });

/** Điều phối trang tiến độ xưởng: dữ liệu board/timeline/nhân viên, quyền, lệnh ghi kèm toast. */
/** `branchId`: chi nhánh ERP đang chọn; bỏ trống là mọi chi nhánh. */
export function useGarageWorkshopProgress(branchId?: string) {
  const { t } = useV2Translation();
  const canEdit = useV2HasPermission({
    collection: "garage_workshop",
    action: "update",
  });
  const canMoveStatus = useV2HasPermission({
    collection: "garage",
    action: "update",
  });
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [workerSearch, setWorkerSearch] = React.useState("");
  const now = useNowTick();

  const [classification, setClassification] = React.useState<string | null>(
    null,
  );
  const boardParams = React.useMemo(
    () => ({ ...BOARD_PARAMS, classification: classification ?? undefined }),
    [classification],
  );
  // Đổi phạm vi hoặc bộ lọc thì đóng xe đang mở, tránh ghi vào xe không còn trên bảng.
  const scopeKey = `${branchId ?? ""}|${classification ?? ""}`;
  const [prevScopeKey, setPrevScopeKey] = React.useState(scopeKey);
  if (prevScopeKey !== scopeKey) {
    setPrevScopeKey(scopeKey);
    setSelectedId(null);
  }
  const board = useCaseWorkshopBoardQuery(boardParams, branchId);
  const all = React.useMemo(() => board.data?.items ?? [], [board.data]);
  const items = React.useMemo(
    () => filterWorkshopCases(all, search),
    [all, search],
  );
  const selected = all.find((c) => c.id === selectedId) ?? null;
  const timeline = useCaseWorkshopTimelineQuery(selectedId, branchId);
  const workers = useWorkshopWorkersQuery(
    workerSearch,
    selected && canEdit ? branchId : undefined,
  );
  const m = useCaseWorkshopMutations(branchId);
  const defaultWorker = useWorkshopDefaultWorker(workers.data ?? []);
  const plate = selected?.licensePlate || selected?.caseCode || "";
  const fail = (
    key: string,
    def: string,
    e: unknown,
    extra: Record<string, string> = {},
  ) =>
    toast(
      t(key, { defaultValue: def, ...extra, reason: extractV2ApiError(e, "") }),
      "destructive",
    );

  const moveStatus = (
    item: CaseWorkshopBoardItem,
    status: WorkshopCaseStatus,
  ) => {
    const p = item.licensePlate || item.caseCode;
    if (!canMoveStatus) {
      toast(
        t(
          "v2.garageCases.workshop.error.noPermissionStatus",
          "Bạn không có quyền đổi trạng thái xe",
        ),
        "destructive",
      );
      return;
    }
    const label = t(`v2.garageCases.workshop.status.${status}`, status);
    m.moveStatus.mutateAsync({ id: item.id, status }).then(
      () =>
        toast(
          t("v2.garageCases.workshop.toast.moved", {
            defaultValue: p,
            plate: p,
            status: label,
          }),
          "success",
        ),
      (e) =>
        fail("v2.garageCases.workshop.toast.moveFailed", p, e, { plate: p }),
    );
  };

  /** Lưu rồi báo toast; lỗi thì báo và ném lại để form giữ dữ liệu. */
  const saved = async (run: () => Promise<unknown>) => {
    try {
      await run();
      toast(
        t("v2.garageCases.workshop.toast.saved", {
          defaultValue: plate,
          plate,
        }),
        "success",
      );
    } catch (e) {
      fail("v2.garageCases.workshop.toast.saveFailed", "Lỗi", e);
      throw e;
    }
  };

  const create = (v: WorkshopLogSubmit) =>
    saved(async () => {
      // Không có xe đang chọn (drawer đóng giữa chừng): báo lỗi thay vì báo đã lưu.
      if (!selectedId) throw new Error("No workshop case selected");
      await m.createLog.mutateAsync({
        caseId: selectedId,
        payload: toCreateLogPayload(v),
      });
    });

  const update = (logId: string, v: WorkshopLogSubmit) =>
    saved(() =>
      m.updateLog.mutateAsync({ logId, payload: toUpdateLogPayload(v) }),
    );

  const remove = async (logId: string) => {
    try {
      await m.removeLog.mutateAsync(logId);
      toast(
        t("v2.garageCases.workshop.toast.removed", "Đã xóa dòng nhật ký"),
        "success",
      );
    } catch (e) {
      fail("v2.garageCases.workshop.toast.removeFailed", "Lỗi", e);
    }
  };

  return {
    isLoading: board.isLoading,
    isError: board.isError,
    refetch: () => void board.refetch(),
    items,
    search,
    setSearch,
    classification,
    setClassification,
    now,
    canEdit,
    canMoveStatus,
    selected,
    open: (c: CaseWorkshopBoardItem) => setSelectedId(c.id),
    openById: setSelectedId,
    boardEmpty: !board.isLoading && all.length === 0 && !classification,
    filterEmpty:
      !board.isLoading && all.length === 0 && Boolean(classification),
    defaultWorker,
    close: () => setSelectedId(null),
    logs: timeline.data ?? [],
    logsLoading: timeline.isLoading,
    workers: workers.data ?? [],
    workersLoading: workers.isFetching,
    setWorkerSearch,
    saving: m.createLog.isPending || m.updateLog.isPending,
    moveStatus,
    create,
    update,
    remove,
  };
}
