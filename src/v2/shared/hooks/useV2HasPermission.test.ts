import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  hasV2Permission,
  useV2HasPermission,
  useV2PermissionChecker,
} from "./useV2HasPermission";

const state = {
  effectivePermissions: [
    { collection: "erp_invoices", actions: ["read", "update"] },
    { collection: "budget", actions: ["*"] },
  ],
};

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: (selector: (s: typeof state) => unknown) => selector(state),
}));

describe("hasV2Permission", () => {
  const permissions = state.effectivePermissions;

  it("allows when no requirement is given", () => {
    expect(hasV2Permission([], undefined)).toBe(true);
  });

  it("defaults the action to read", () => {
    expect(hasV2Permission(permissions, { collection: "erp_invoices" })).toBe(
      true,
    );
  });

  it("rejects an action the user does not have", () => {
    expect(
      hasV2Permission(permissions, {
        collection: "erp_invoices",
        action: "delete",
      }),
    ).toBe(false);
  });

  it("accepts a wildcard action", () => {
    expect(
      hasV2Permission(permissions, { collection: "budget", action: "delete" }),
    ).toBe(true);
  });

  it("accepts a wildcard collection", () => {
    expect(
      hasV2Permission([{ collection: "*", actions: ["read"] }], {
        collection: "anything",
      }),
    ).toBe(true);
  });

  it("rejects an unknown collection", () => {
    expect(hasV2Permission(permissions, { collection: "payroll" })).toBe(false);
  });
});

describe("useV2HasPermission", () => {
  it("reads permissions from the auth store", () => {
    const { result } = renderHook(() =>
      useV2HasPermission({ collection: "erp_invoices", action: "update" }),
    );
    expect(result.current).toBe(true);
  });

  it("exposes a checker for lists", () => {
    const { result } = renderHook(() => useV2PermissionChecker());
    expect(result.current({ collection: "payroll" })).toBe(false);
    expect(result.current({ collection: "budget" })).toBe(true);
  });
});
