import { describe, expect, it } from "vitest";
import type { ProcurementApprovalEvent } from "../../../../procurement.types";
import {
  mapProcurementActionVariant,
  toAuditRows,
} from "./ProcurementRequestAuditSection.helper";

const t = (_key: string, fallback: string) => fallback;

const event = (
  over: Partial<ProcurementApprovalEvent> = {},
): ProcurementApprovalEvent => ({
  action: "approve",
  fromStatus: "PENDING_APPROVAL",
  toStatus: "APPROVED",
  actorId: "00000000-0000-0000-0000-000000000001",
  actorName: null,
  actorEmail: null,
  actorRoles: [],
  comment: null,
  createdAt: "2026-11-06T13:39:00",
  ...over,
});

describe("mapProcurementActionVariant", () => {
  it("ánh xạ đúng màu theo hành động, auto_approved là thành công", () => {
    expect(mapProcurementActionVariant("approve")).toBe("success");
    expect(mapProcurementActionVariant("AUTO_APPROVED")).toBe("success");
    expect(mapProcurementActionVariant("reject")).toBe("danger");
    expect(mapProcurementActionVariant("cancel")).toBe("danger");
    expect(mapProcurementActionVariant("submit")).toBe("warning");
    expect(mapProcurementActionVariant("other")).toBe("default");
  });
});

describe("toAuditRows", () => {
  it("tác nhân ưu tiên họ tên, rồi email; không bao giờ hiện UUID", () => {
    const [byName, byEmail, unknown] = toAuditRows(
      [
        event({ actorName: "Trưởng garage", actorEmail: "t@x.vn" }),
        event({ actorName: null, actorEmail: "b@x.vn" }),
        event({ actorName: null, actorEmail: null }),
      ],
      t,
    );
    expect(byName.actor).toBe("Trưởng garage");
    expect(byEmail.actor).toBe("b@x.vn");
    expect(unknown.actor).toBe("Không xác định");
  });

  it("lý do là comment, có tiền tố; không có comment thì không có chi tiết", () => {
    const [withReason, without] = toAuditRows(
      [event({ action: "cancel", comment: "Test hủy" }), event()],
      t,
    );
    expect(withReason.details).toBe("Lý do: Test hủy");
    expect(without.details).toBeUndefined();
  });

  it("thời gian dạng dd/MM/yyyy HH:mm, không còn chuỗi ISO", () => {
    const [row] = toAuditRows([event({ createdAt: "2026-11-06T13:39:00" })], t);
    expect(row.timestamp).toBe("06/11/2026 13:39");
    expect(row.timestamp).not.toContain("T");
  });

  it("giữ toStatus để hiển thị badge trạng thái sau hành động", () => {
    const [row] = toAuditRows(
      [event({ action: "cancel", toStatus: "CANCELLED" })],
      t,
    );
    expect(row.toStatus).toBe("CANCELLED");
    expect(row.variant).toBe("danger");
  });

  it("key ổn định theo thứ tự và thời điểm, không dùng UUID", () => {
    const rows = toAuditRows([event(), event({ action: "submit" })], t);
    expect(new Set(rows.map((r) => r.key)).size).toBe(2);
  });
});
