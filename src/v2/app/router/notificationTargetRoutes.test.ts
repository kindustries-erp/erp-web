import { describe, expect, it } from "vitest";
import {
  PROCUREMENT_REQUEST_GARAGE_TARGET,
  resolveNotificationHref,
} from "./notificationTargetRoutes";

describe("resolveNotificationHref", () => {
  it("gửi duyệt: mở modal duyệt của đúng phiếu (action=APPROVE)", () => {
    const href = resolveNotificationHref(
      {
        module: PROCUREMENT_REQUEST_GARAGE_TARGET,
        id: "req-1",
        action: "APPROVE",
      },
      "/v2/garage-procurement",
    );
    expect(href).toBe(
      "/v2/garage-procurement?tab=requests&open=req-1&action=APPROVE",
    );
  });

  it("duyệt hoặc từ chối: chỉ mở drawer xem (không có action)", () => {
    const href = resolveNotificationHref(
      {
        module: PROCUREMENT_REQUEST_GARAGE_TARGET,
        id: "req-2",
        action: "VIEW",
      },
      "/garage-procurement",
    );
    expect(href).toBe("/garage-procurement?tab=requests&open=req-2");
  });

  it("giữ tiền tố /v2 khi đang ở shell V2, không thêm khi không ở V2", () => {
    const target = {
      module: PROCUREMENT_REQUEST_GARAGE_TARGET,
      id: "r",
      action: "VIEW",
    };
    expect(resolveNotificationHref(target, "/v2/garage-procurement")).toMatch(
      /^\/v2\/garage-procurement\?/,
    );
    expect(resolveNotificationHref(target, "/garage-procurement")).toMatch(
      /^\/garage-procurement\?/,
    );
  });

  it("đích không được hỗ trợ hoặc thiếu target trả null", () => {
    expect(resolveNotificationHref(null, "/v2/x")).toBeNull();
    expect(resolveNotificationHref(undefined, "/v2/x")).toBeNull();
    expect(
      resolveNotificationHref(
        { module: "INVOICE", id: "9", action: "VIEW" },
        "/v2/x",
      ),
    ).toBeNull();
    expect(
      resolveNotificationHref(
        { module: PROCUREMENT_REQUEST_GARAGE_TARGET, id: "", action: "VIEW" },
        "/v2/x",
      ),
    ).toBeNull();
  });
});
