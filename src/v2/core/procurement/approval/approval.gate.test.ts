import { describe, expect, it } from "vitest";
import {
  applyApprovalGate,
  NO_APPROVAL_GATE,
  requiresApproverPick,
  type ApprovalGate,
} from "./approval.gate";

const ON: ApprovalGate = {
  configured: true,
  enabled: true,
  currentUserId: "me",
};
const OFF: ApprovalGate = { ...ON, enabled: false };
const ALL = ["submit", "recall", "approve", "reject"] as const;

describe("applyApprovalGate", () => {
  it("không cấu hình duyệt thì giữ nguyên danh sách", () => {
    expect(
      applyApprovalGate([...ALL], NO_APPROVAL_GATE, {
        approverId: "other",
        createdBy: "me",
      }),
    ).toEqual([...ALL]);
  });

  it("khóa bật, chưa có người duyệt: duyệt/từ chối hiện cho người có quyền", () => {
    expect(
      applyApprovalGate([...ALL], ON, { approverId: null, createdBy: "other" }),
    ).toEqual([...ALL]);
  });

  it("khóa bật, đúng người được chọn: hiện duyệt/từ chối", () => {
    expect(
      applyApprovalGate([...ALL], ON, { approverId: "me", createdBy: "other" }),
    ).toEqual([...ALL]);
  });

  it("khóa bật, người khác được chọn: ẩn duyệt/từ chối", () => {
    expect(
      applyApprovalGate([...ALL], ON, {
        approverId: "boss",
        createdBy: "other",
      }),
    ).toEqual(["submit", "recall"]);
  });

  it("khóa tắt: ẩn duyệt/từ chối", () => {
    expect(
      applyApprovalGate([...ALL], OFF, {
        approverId: "me",
        createdBy: "other",
      }),
    ).toEqual(["submit", "recall"]);
  });

  it("người tạo chứng từ không thấy duyệt/từ chối, kể cả khi là người được chọn", () => {
    expect(
      applyApprovalGate([...ALL], ON, { approverId: "me", createdBy: "me" }),
    ).toEqual(["submit", "recall"]);
  });

  it("người khác không được chỉ định, không phải người tạo: ẩn duyệt/từ chối", () => {
    expect(
      applyApprovalGate([...ALL], ON, {
        approverId: "boss",
        createdBy: "other",
      }),
    ).toEqual(["submit", "recall"]);
  });

  it("người được chỉ định (khác người tạo): hiện duyệt/từ chối", () => {
    expect(
      applyApprovalGate([...ALL], ON, { approverId: "me", createdBy: "other" }),
    ).toEqual([...ALL]);
  });

  it("chưa có người duyệt, không phải người tạo: giữ như cũ", () => {
    expect(
      applyApprovalGate([...ALL], ON, { approverId: null, createdBy: "other" }),
    ).toEqual([...ALL]);
  });
});

describe("requiresApproverPick", () => {
  it("chỉ gửi duyệt khi khóa bật mới cần chọn người", () => {
    expect(requiresApproverPick(ON, "submit")).toBe(true);
    expect(requiresApproverPick(OFF, "submit")).toBe(false);
    expect(requiresApproverPick(ON, "approve")).toBe(false);
    expect(requiresApproverPick(NO_APPROVAL_GATE, "submit")).toBe(false);
  });
});
