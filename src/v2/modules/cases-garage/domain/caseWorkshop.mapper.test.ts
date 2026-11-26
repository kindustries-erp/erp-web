import { describe, expect, it } from "vitest";
import { toCreateLogPayload, toUpdateLogPayload } from "./caseWorkshop.mapper";

describe("caseWorkshop.mapper", () => {
  it("tạo STAGE: gửi stage, bỏ note rỗng và giờ trống, không gửi giờ kết thúc", () => {
    expect(
      toCreateLogPayload({
        kind: "STAGE",
        stage: "QC",
        note: null,
        workerId: "e1",
        workerName: "Thợ A",
        endedAt: "2026-11-24T09:00:00.000Z",
      }),
    ).toEqual({
      kind: "STAGE",
      stage: "QC",
      workerId: "e1",
      workerName: "Thợ A",
    });
  });

  it("tạo NOTE: không gửi stage, giữ giờ sửa tay", () => {
    expect(
      toCreateLogPayload({
        kind: "NOTE",
        stage: "QC",
        note: "Đã gọi khách",
        workerId: null,
        workerName: null,
        startedAt: "2026-11-24T08:00:00.000Z",
      }),
    ).toEqual({
      kind: "NOTE",
      note: "Đã gọi khách",
      workerId: null,
      workerName: null,
      startedAt: "2026-11-24T08:00:00.000Z",
    });
  });

  it("sửa dòng: null để xóa mô tả/người làm, chỉ gửi giờ khi có", () => {
    expect(
      toUpdateLogPayload({
        kind: "STAGE",
        note: null,
        workerId: null,
        workerName: null,
        endedAt: "2026-11-24T09:00:00.000Z",
      }),
    ).toEqual({
      note: null,
      workerId: null,
      workerName: null,
      endedAt: "2026-11-24T09:00:00.000Z",
    });
  });
});
