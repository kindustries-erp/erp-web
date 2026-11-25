import * as React from "react";
import type {
  WorkshopCandidateView,
  WorkshopTrackSubmit,
} from "@/v2/core/cases-garage";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { useCaseWorkshopMutations } from "../api/queries/useCaseWorkshopMutations";
import { useWorkshopCandidatesQuery } from "../api/queries/useCaseWorkshopQueries";
import type { CaseWorkshopBoardItem } from "../domain/caseWorkshop.type";

const toast = (title: string, variant: "success" | "destructive") =>
  useV2ToastStore.getState().showToast({ title, variant });

const plateOf = (c: { licensePlate: string | null; caseCode: string }) =>
  c.licensePlate || c.caseCode;

/**
 * Đưa xe vào và bỏ xe khỏi bảng tiến độ: hộp thoại tìm biển số (ứng viên từ API), lệnh track/track-new,
 * hộp xác nhận bỏ khỏi bảng. Quyền: `garage_workshop:update` để thêm/bỏ, `garage:create` để tạo xe mới,
 * `garage:update` để đổi trạng thái khi thêm. `createBranchId`: chi nhánh gắn cho xe tạo mới.
 */
export function useGarageWorkshopTracking(
  branchId: string | undefined,
  onTracked?: (caseId: string) => void,
  createBranchId: string | undefined = branchId,
) {
  const { t } = useV2Translation();
  const canEdit = useV2HasPermission({
    collection: "garage_workshop",
    action: "update",
  });
  const canCreate = useV2HasPermission({
    collection: "garage",
    action: "create",
  });
  const canChangeStatus = useV2HasPermission({
    collection: "garage",
    action: "update",
  });
  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [untrackTarget, setUntrackTarget] =
    React.useState<CaseWorkshopBoardItem | null>(null);
  const candidates = useWorkshopCandidatesQuery(search, branchId, addOpen);
  const m = useCaseWorkshopMutations(branchId, createBranchId);
  const k = (key: string) => `v2.garageCases.workshop.toast.${key}`;
  const fail = (key: string, e: unknown) =>
    toast(
      t(k(key), {
        defaultValue: "{{reason}}",
        reason: extractV2ApiError(e, ""),
      }),
      "destructive",
    );

  const submit = async (v: WorkshopTrackSubmit) => {
    try {
      const res =
        v.mode === "new"
          ? await m.trackNew.mutateAsync({
              licensePlate: v.licensePlate,
              customerName: v.customerName,
              status: v.status,
            })
          : await m.track.mutateAsync({ caseId: v.caseId, status: v.status });
      const plate = plateOf(res);
      toast(
        t(k("tracked"), {
          defaultValue: "Đã đưa xe {{plate}} vào bảng",
          plate,
        }),
        "success",
      );
      onTracked?.(res.caseId);
      return res;
    } catch (e) {
      fail("trackFailed", e);
      throw e;
    }
  };

  const confirmUntrack = async () => {
    const target = untrackTarget;
    if (!target) return;
    setUntrackTarget(null);
    try {
      await m.untrack.mutateAsync(target.id);
      const plate = plateOf(target);
      toast(
        t(k("untracked"), {
          defaultValue: "Đã bỏ xe {{plate}} khỏi bảng",
          plate,
        }),
        "success",
      );
    } catch (e) {
      fail("untrackFailed", e);
    }
  };

  return {
    canAdd: canEdit,
    canCreate,
    canChangeStatus,
    addOpen,
    openAdd: () => {
      setSearch("");
      setAddOpen(true);
    },
    closeAdd: () => setAddOpen(false),
    search,
    setSearch,
    candidates: (candidates.data ?? []) as WorkshopCandidateView[],
    candidatesLoading: candidates.isFetching,
    submitting: m.track.isPending || m.trackNew.isPending,
    submit,
    untrackTarget,
    askUntrack: (item: CaseWorkshopBoardItem) => setUntrackTarget(item),
    cancelUntrack: () => setUntrackTarget(null),
    confirmUntrack,
  };
}
