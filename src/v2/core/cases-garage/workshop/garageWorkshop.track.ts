import type {
  WorkshopCandidateView,
  WorkshopCaseOrigin,
  WorkshopCaseStatus,
  WorkshopTrackSubmit,
} from "./garageWorkshop.type";

/** Giá trị lựa chọn "xe chưa có, tạo mới" trong danh sách ứng viên. */
export const WORKSHOP_NEW_CANDIDATE = "__new__";

const ALL: readonly WorkshopCaseStatus[] = [
  "INTAKE",
  "QUOTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

/** Bảng chuyển trạng thái của xe nhập ở ERP (`NATIVE`), khớp backend `kgara-status.map.ts`. */
export const WORKSHOP_NATIVE_TRANSITIONS: Readonly<
  Record<WorkshopCaseStatus, readonly WorkshopCaseStatus[]>
> = {
  INTAKE: ["QUOTED", "IN_PROGRESS", "CANCELLED"],
  QUOTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["IN_PROGRESS"],
  CANCELLED: ["INTAKE"],
};

/**
 * Trạng thái đổi được của xe có sẵn: luôn gồm trạng thái hiện tại; không có quyền `garage:update` thì chỉ
 * giữ nguyên. Xe KGara đổi tự do (ghi đè ở ERP), xe NATIVE theo `WORKSHOP_NATIVE_TRANSITIONS`.
 */
export function allowedStatuses(
  c: { origin: WorkshopCaseOrigin; status: WorkshopCaseStatus },
  canChangeStatus: boolean,
): ReadonlySet<WorkshopCaseStatus> {
  if (!canChangeStatus) return new Set([c.status]);
  if (c.origin === "KGARA_SYNC") return new Set(ALL);
  return new Set([c.status, ...WORKSHOP_NATIVE_TRANSITIONS[c.status]]);
}

/**
 * Trạng thái chọn được khi đưa xe vào bảng.
 * - Xe mới: tạo ở `INTAKE` rồi chuyển theo bảng NATIVE.
 * - Xe có sẵn: luôn giữ được trạng thái hiện tại; đổi cần quyền `garage:update`. Xe KGara đổi tự do
 *   (ghi đè ở ERP), xe NATIVE theo bảng chuyển.
 */
export function allowedTrackStatuses(
  target: WorkshopCandidateView | "new",
  canChangeStatus: boolean,
): ReadonlySet<WorkshopCaseStatus> {
  if (target === "new") {
    return new Set<WorkshopCaseStatus>([
      "INTAKE",
      ...WORKSHOP_NATIVE_TRANSITIONS.INTAKE,
    ]);
  }
  return allowedStatuses(target, canChangeStatus);
}

/** Biển số hiển thị và gửi khi tạo xe mới: bỏ khoảng trắng thừa, viết hoa. */
export const normalizeNewPlate = (search: string) =>
  search.trim().replace(/\s+/g, " ").toUpperCase();

/** Lệnh gửi đi; xe có sẵn giữ trạng thái thì không gửi `status`. */
export function toTrackSubmit(
  selected: WorkshopCandidateView | "new",
  status: WorkshopCaseStatus,
  plate: string,
  customerName: string,
): WorkshopTrackSubmit {
  if (selected === "new") {
    return {
      mode: "new",
      licensePlate: normalizeNewPlate(plate),
      customerName: customerName.trim() || undefined,
      status,
    };
  }
  return {
    mode: "existing",
    caseId: selected.id,
    status: status === selected.status ? undefined : status,
  };
}
