import {
  WORKSHOP_STAGE_DANGER_MINUTES,
  WORKSHOP_STAGE_WARN_MINUTES,
  WORKSHOP_STATUSES,
  type WorkshopStatusConfig,
} from "./garageWorkshop.config";
import type {
  WorkshopCaseStatus,
  WorkshopCaseView,
  WorkshopLogFormValue,
  WorkshopLogSubmit,
} from "./garageWorkshop.type";

type T = (key: string, def?: string | Record<string, unknown>) => string;

export function statusConfigOf(status: string): WorkshopStatusConfig {
  return (
    WORKSHOP_STATUSES.find((s) => s.key === status) ?? WORKSHOP_STATUSES[0]
  );
}

export function stagesOf(status: string): readonly string[] {
  return statusConfigOf(status).stages;
}

/** Số phút từ mốc ISO tới `now` (không âm); null khi không có mốc. */
export function minutesSince(
  iso: string | null | undefined,
  now: Date,
): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / 60_000));
}

/** "45 phút", "2 giờ 5 phút", "3 ngày 4 giờ" theo locale. */
export function formatDuration(minutes: number | null, t: T): string {
  if (minutes === null) return "";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  const d = t("v2.garageCases.workshop.unit.day", "ngày");
  const h = t("v2.garageCases.workshop.unit.hour", "giờ");
  const m = t("v2.garageCases.workshop.unit.minute", "phút");
  if (days > 0) return hours ? `${days} ${d} ${hours} ${h}` : `${days} ${d}`;
  if (hours > 0) return mins ? `${hours} ${h} ${mins} ${m}` : `${hours} ${h}`;
  return `${mins} ${m}`;
}

export type WorkshopClockTone = "normal" | "warn" | "danger";

export function clockTone(minutes: number | null): WorkshopClockTone {
  if (minutes === null) return "normal";
  if (minutes >= WORKSHOP_STAGE_DANGER_MINUTES) return "danger";
  if (minutes >= WORKSHOP_STAGE_WARN_MINUTES) return "warn";
  return "normal";
}

/** Lọc theo biển số, mã phiếu, khách hàng, người làm (không phân biệt hoa thường). */
export function filterWorkshopCases<C extends WorkshopCaseView>(
  items: C[],
  search: string,
): C[] {
  const q = search.trim().toLowerCase();
  if (!q) return items;
  return items.filter((c) =>
    [
      c.licensePlate,
      c.caseCode,
      c.customerName,
      c.assigneeName,
      c.stageWorkerName,
    ].some((v) => (v ?? "").toLowerCase().includes(q)),
  );
}

/** Xe của một status, xếp theo thứ tự status nhỏ (chưa có status nhỏ lên đầu), rồi công đoạn mở lâu nhất trước. */
export function casesOfStatus<C extends WorkshopCaseView>(
  items: C[],
  status: WorkshopCaseStatus,
): C[] {
  const order = stagesOf(status);
  const rank = (c: C) =>
    c.progressStage ? order.indexOf(c.progressStage) + 1 : 0;
  return items
    .filter((c) => c.status === status)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.stageStartedAt ?? "").localeCompare(b.stageStartedAt ?? ""),
    );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO → `yyyy-MM-ddTHH:mm` theo giờ máy (giá trị `V2DateTimePicker`). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO → `dd/MM HH:mm` theo giờ máy (hiển thị timeline). */
export function formatDayTime(iso: string | null | undefined): string {
  const v = toLocalInput(iso);
  if (!v) return "";
  const [date, time] = v.split("T");
  const [, mm, dd] = date.split("-");
  return `${dd}/${mm} ${time}`;
}

/** `yyyy-MM-ddTHH:mm` (giờ máy, từ `V2DateTimePicker`) → ISO; rỗng/lỗi trả `undefined`. */
export function fromLocalInput(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Form → payload: cắt khoảng trắng, giờ rỗng thì bỏ (server lấy hiện tại). */
export function toLogSubmit(v: WorkshopLogFormValue): WorkshopLogSubmit {
  return {
    kind: v.kind,
    stage: v.kind === "STAGE" ? v.stage || undefined : undefined,
    note: v.note.trim() || null,
    workerId: v.workerId,
    workerName: v.workerName.trim() || null,
    startedAt: fromLocalInput(v.startedAt),
    endedAt: fromLocalInput(v.endedAt),
  };
}

/** Lỗi chặn lưu (khóa locale), null khi hợp lệ. */
export function validateLogForm(v: WorkshopLogFormValue): string | null {
  if (v.kind === "STAGE" && !v.stage)
    return "v2.garageCases.workshop.error.stageRequired";
  if (v.kind === "NOTE" && !v.note.trim())
    return "v2.garageCases.workshop.error.noteRequired";
  if (v.startedAt && v.endedAt && v.endedAt < v.startedAt)
    return "v2.garageCases.workshop.error.endBeforeStart";
  return null;
}
