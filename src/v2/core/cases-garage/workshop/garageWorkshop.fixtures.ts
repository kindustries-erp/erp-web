import type {
  WorkshopCandidateView,
  WorkshopCaseView,
  WorkshopLogView,
  WorkshopWorkerOption,
} from "./garageWorkshop.type";

/** Dữ liệu mẫu cho test và Storybook của trang tiến độ xưởng (không dùng ở runtime). */
export const workshopCaseFixture = (
  over: Partial<WorkshopCaseView> = {},
): WorkshopCaseView => ({
  id: "c1",
  caseCode: "VV-001",
  licensePlate: "51A-12345",
  vehicleBrandName: "VinFast",
  vehicleModelName: "VF8",
  customerName: "Nguyễn Văn A",
  workSummary: null,
  status: "IN_PROGRESS",
  origin: "NATIVE",
  progressStage: "PAINTING",
  assigneeName: "Thợ chính",
  expectedCompletionAt: null,
  isOverdue: false,
  stageStartedAt: "2026-11-24T08:30:00.000Z",
  totalElapsedMinutes: 240,
  stageWorkerName: "Thợ sơn",
  lastNote: "Chờ sơn lót khô",
  ...over,
});

export const workshopLogFixture = (
  over: Partial<WorkshopLogView> = {},
): WorkshopLogView => ({
  id: "l1",
  kind: "STAGE",
  caseStatus: "IN_PROGRESS",
  stage: "REPAIRING",
  note: null,
  workerId: "e1",
  workerName: "Thợ A",
  startedAt: "2026-11-24T07:00:00.000Z",
  endedAt: "2026-11-24T08:30:00.000Z",
  durationMinutes: 90,
  ...over,
});

export const workshopWorkersFixture: WorkshopWorkerOption[] = [
  { id: "e1", code: "NV01", fullName: "Thợ A", jobTitle: "KTV" },
  { id: "e2", code: "NV02", fullName: "Thợ B", jobTitle: "Thợ sơn" },
];

export const WORKSHOP_FIXTURE_NOW = new Date("2026-11-24T10:00:00.000Z");

export const workshopCandidatesFixture: WorkshopCandidateView[] = [
  {
    id: "k1",
    caseCode: "KG-0001",
    licensePlate: "51G-123.45",
    customerName: "Trần Thị B",
    vehicleName: "Toyota Vios",
    origin: "KGARA_SYNC",
    status: "QUOTED",
    onBoard: false,
  },
  {
    id: "n1",
    caseCode: "VV-2611-0001",
    licensePlate: "51G-123.99",
    customerName: null,
    vehicleName: null,
    origin: "NATIVE",
    status: "INTAKE",
    onBoard: true,
  },
];
