import type { WorkshopLogSubmit } from "@/v2/core/cases-garage";
import type {
  CreateCaseProgressLogPayload,
  UpdateCaseProgressLogPayload,
} from "./caseWorkshop.type";

/** Form ghi tiến độ → body `POST :id/progress-logs` (không gửi giờ kết thúc; bỏ field rỗng). */
export function toCreateLogPayload(
  v: WorkshopLogSubmit,
): CreateCaseProgressLogPayload {
  return {
    kind: v.kind,
    ...(v.kind === "STAGE" && v.stage ? { stage: v.stage } : {}),
    ...(v.note ? { note: v.note } : {}),
    workerId: v.workerId,
    workerName: v.workerName,
    ...(v.startedAt ? { startedAt: v.startedAt } : {}),
  };
}

/** Form sửa dòng → body `PATCH progress-logs/:logId`; `null` xóa mô tả/người làm, giờ rỗng thì giữ nguyên. */
export function toUpdateLogPayload(
  v: WorkshopLogSubmit,
): UpdateCaseProgressLogPayload {
  return {
    note: v.note,
    workerId: v.workerId,
    workerName: v.workerName,
    ...(v.startedAt ? { startedAt: v.startedAt } : {}),
    ...(v.endedAt ? { endedAt: v.endedAt } : {}),
  };
}
