import { describe, expect, it } from "vitest";
import { createUserKeys } from "../userKeys";
import { toUserAuditItems } from "./useUserAuditTimelineQuery";

const t = (_key: string, fallback?: string) => fallback ?? _key;

describe("toUserAuditItems", () => {
  it("map dòng audit sang item timeline, giữ mã hành động lạ", () => {
    const items = toUserAuditItems(
      [
        {
          id: "1",
          actionType: "RESET_PASSWORD",
          actorEmail: "admin@liouni.com",
          message: null,
          status: "SUCCESS",
          createdAt: "2026-11-15T10:00:00Z",
        },
        {
          id: "2",
          actionType: "X",
          actorEmail: null,
          message: "lỗi",
          status: "FAILED",
          createdAt: "2026-11-15T11:00:00Z",
        },
      ],
      t,
    );
    expect(items[0]).toMatchObject({
      id: "1",
      action: "RESET_PASSWORD",
      actor: "admin@liouni.com",
      variant: "default",
    });
    expect(items[1]).toMatchObject({
      action: "X",
      actor: undefined,
      variant: "danger",
      details: "lỗi",
    });
  });
});

describe("userKeys.audit", () => {
  it("khóa audit gắn theo id và base của module", () => {
    expect(createUserKeys(["m"]).audit("u1")).toEqual(["m", "audit", "u1"]);
  });
});
