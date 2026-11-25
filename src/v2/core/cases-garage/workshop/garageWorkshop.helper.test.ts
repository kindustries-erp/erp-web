import { describe, expect, it } from "vitest";
import {
  WORKSHOP_STAGE_DEFAULT_LABELS,
  WORKSHOP_STATUSES,
} from "./garageWorkshop.config";
import {
  casesOfStatus,
  clockTone,
  filterWorkshopCases,
  formatDayTime,
  formatDuration,
  fromLocalInput,
  minutesSince,
  stagesOf,
  toLocalInput,
  toLogSubmit,
  validateLogForm,
} from "./garageWorkshop.helper";
import type {
  WorkshopCaseView,
  WorkshopLogFormValue,
} from "./garageWorkshop.type";

const t = (_k: string, def?: unknown) => String(def ?? "");
const NOW = new Date("2026-11-24T10:00:00.000Z");

const view = (over: Partial<WorkshopCaseView>): WorkshopCaseView => ({
  id: "c",
  caseCode: "VV-1",
  licensePlate: "51A-123",
  vehicleBrandName: null,
  vehicleModelName: null,
  customerName: "Khách A",
  workSummary: null,
  status: "IN_PROGRESS",
  origin: "NATIVE",
  progressStage: null,
  assigneeName: null,
  expectedCompletionAt: null,
  isOverdue: false,
  stageStartedAt: null,
  totalElapsedMinutes: null,
  stageWorkerName: null,
  lastNote: null,
  ...over,
});

describe("garageWorkshop config", () => {
  it("đủ 5 status theo quy trình; mọi status nhỏ có nhãn, không trùng giữa status", () => {
    expect(WORKSHOP_STATUSES.map((s) => s.key)).toEqual([
      "INTAKE",
      "QUOTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]);
    const all = WORKSHOP_STATUSES.flatMap((s) => s.stages);
    expect(new Set(all).size).toBe(all.length);
    for (const code of all)
      expect(WORKSHOP_STAGE_DEFAULT_LABELS[code]).toBeTruthy();
    expect(
      WORKSHOP_STATUSES.some((s) => /blue|#/.test(s.accentClassName)),
    ).toBe(false);
  });
});

describe("garageWorkshop helper", () => {
  it("minutesSince và formatDuration", () => {
    expect(minutesSince("2026-11-24T08:30:00.000Z", NOW)).toBe(90);
    expect(minutesSince(null, NOW)).toBeNull();
    expect(formatDuration(45, t)).toBe("45 phút");
    expect(formatDuration(125, t)).toBe("2 giờ 5 phút");
    expect(formatDuration(120, t)).toBe("2 giờ");
    expect(formatDuration(1440 * 3 + 240, t)).toBe("3 ngày 4 giờ");
    expect(formatDuration(null, t)).toBe("");
  });

  it("clockTone theo ngưỡng 8 giờ và 24 giờ", () => {
    expect(clockTone(60)).toBe("normal");
    expect(clockTone(8 * 60)).toBe("warn");
    expect(clockTone(24 * 60)).toBe("danger");
    expect(clockTone(null)).toBe("normal");
  });

  it("stagesOf, lọc tìm kiếm, xếp xe trong cột theo status nhỏ", () => {
    expect(stagesOf("COMPLETED")).toEqual(["AWAITING_PAYMENT", "DELIVERED"]);
    const items = [
      view({
        id: "a",
        progressStage: "QC",
        stageStartedAt: "2026-11-24T01:00:00Z",
      }),
      view({ id: "b", progressStage: "WAITING_PARTS" }),
      view({ id: "c", progressStage: null }),
      view({ id: "d", status: "INTAKE", stageWorkerName: "Thợ Bình" }),
    ];
    expect(casesOfStatus(items, "IN_PROGRESS").map((c) => c.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
    expect(filterWorkshopCases(items, "bình").map((c) => c.id)).toEqual(["d"]);
    expect(filterWorkshopCases(items, " ")).toHaveLength(4);
  });

  it("đổi qua lại giá trị datetime-local", () => {
    const iso = "2026-11-24T03:05:00.000Z";
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
    expect(fromLocalInput("")).toBeUndefined();
    expect(toLocalInput(null)).toBe("");
    const local = toLocalInput(iso);
    expect(formatDayTime(iso)).toBe(
      `${local.slice(8, 10)}/${local.slice(5, 7)} ${local.slice(11)}`,
    );
    expect(formatDayTime(null)).toBe("");
  });

  it("validate và chuyển form sang payload", () => {
    const base: WorkshopLogFormValue = {
      kind: "STAGE",
      stage: "",
      note: "",
      workerId: null,
      workerName: "",
      startedAt: "",
      endedAt: "",
    };
    expect(validateLogForm(base)).toBe(
      "v2.garageCases.workshop.error.stageRequired",
    );
    expect(validateLogForm({ ...base, kind: "NOTE" })).toBe(
      "v2.garageCases.workshop.error.noteRequired",
    );
    expect(
      validateLogForm({
        ...base,
        stage: "QC",
        startedAt: "2026-11-24T10:00",
        endedAt: "2026-11-24T09:00",
      }),
    ).toBe("v2.garageCases.workshop.error.endBeforeStart");
    const ok = {
      ...base,
      stage: "QC",
      note: "  xong  ",
      workerId: "e1",
      workerName: " A ",
    };
    expect(validateLogForm(ok)).toBeNull();
    expect(toLogSubmit(ok)).toEqual({
      kind: "STAGE",
      stage: "QC",
      note: "xong",
      workerId: "e1",
      workerName: "A",
      startedAt: undefined,
      endedAt: undefined,
    });
  });
});
