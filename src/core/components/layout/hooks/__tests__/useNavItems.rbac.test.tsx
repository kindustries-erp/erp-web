import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavItems } from "../useNavItems";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    employee: { email: "garage@greenwayauto.vn" },
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (k: string, fallback?: string) => fallback ?? k,
}));

describe("useNavItems RBAC Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("excludes dashboard and attachments when user lacks permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      if (resource === ErpResource.GARAGE) return true;
      return false;
    });

    const { result } = renderHook(() => useNavItems());
    const keys = result.current.map((item) => item.key);

    expect(keys).not.toContain("dashboard");
    expect(keys).not.toContain("attachments");
    expect(keys).toContain("garage-cases");
  });

  it("includes dashboard and attachments when user has permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      if (resource === ErpResource.DASHBOARD) return true;
      if (resource === ErpResource.ATTACHMENTS) return true;
      return false;
    });

    const { result } = renderHook(() => useNavItems());
    const keys = result.current.map((item) => item.key);

    expect(keys).toContain("dashboard");
    expect(keys).toContain("attachments");
  });
});
