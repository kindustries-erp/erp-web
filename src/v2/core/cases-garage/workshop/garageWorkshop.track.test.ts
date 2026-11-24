import { describe, expect, it } from "vitest";
import {
  allowedStatuses,
  allowedTrackStatuses,
  normalizeNewPlate,
  toTrackSubmit,
} from "./garageWorkshop.track";
import type { WorkshopCandidateView } from "./garageWorkshop.type";

const cand = (
  over: Partial<WorkshopCandidateView> = {},
): WorkshopCandidateView => ({
  id: "c1",
  caseCode: "VV-1",
  licensePlate: "51G-12345",
  customerName: null,
  vehicleName: null,
  origin: "NATIVE",
  status: "QUOTED",
  onBoard: false,
  ...over,
});

describe("allowedTrackStatuses", () => {
  it("xe mới: INTAKE và các bước chuyển từ INTAKE, không vào thẳng Hoàn thành", () => {
    expect([...allowedTrackStatuses("new", true)]).toEqual([
      "INTAKE",
      "QUOTED",
      "IN_PROGRESS",
      "CANCELLED",
    ]);
  });

  it("không có quyền đổi trạng thái: chỉ giữ trạng thái hiện tại", () => {
    expect([...allowedTrackStatuses(cand(), false)]).toEqual(["QUOTED"]);
  });

  it("xe KGara đổi tự do; xe NATIVE theo bảng chuyển", () => {
    expect(
      allowedTrackStatuses(cand({ origin: "KGARA_SYNC" }), true).size,
    ).toBe(5);
    expect([...allowedTrackStatuses(cand(), true)]).toEqual([
      "QUOTED",
      "IN_PROGRESS",
      "CANCELLED",
    ]);
  });
});

describe("toTrackSubmit", () => {
  it("xe có sẵn giữ trạng thái thì không gửi status; đổi thì gửi", () => {
    expect(toTrackSubmit(cand(), "QUOTED", "", "")).toEqual({
      mode: "existing",
      caseId: "c1",
      status: undefined,
    });
    expect(toTrackSubmit(cand(), "IN_PROGRESS", "", "")).toMatchObject({
      status: "IN_PROGRESS",
    });
  });

  it("xe mới: biển số viết hoa, bỏ tên khách rỗng", () => {
    expect(toTrackSubmit("new", "INTAKE", " 30a  999.99 ", "  ")).toEqual({
      mode: "new",
      licensePlate: "30A 999.99",
      customerName: undefined,
      status: "INTAKE",
    });
    expect(normalizeNewPlate("51g-1")).toBe("51G-1");
  });
});

describe("allowedStatuses", () => {
  it("xe ERP Báo giá: giữ, sang Đang làm hoặc Hủy; KGara: mọi trạng thái; không quyền: chỉ giữ", () => {
    expect([
      ...allowedStatuses({ origin: "NATIVE", status: "QUOTED" }, true),
    ]).toEqual(["QUOTED", "IN_PROGRESS", "CANCELLED"]);
    expect(
      allowedStatuses({ origin: "KGARA_SYNC", status: "QUOTED" }, true).size,
    ).toBe(5);
    expect([
      ...allowedStatuses({ origin: "KGARA_SYNC", status: "QUOTED" }, false),
    ]).toEqual(["QUOTED"]);
  });
});
