import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useV2AdaptedNavSections } from "../useV2AdaptedNavSections";
import { useV2AdaptedTabs } from "../useV2AdaptedTabs";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource } from "@/modules/system/types/rbac";
import { Banknote, Landmark, Sliders } from "@/v2/shared/components";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    employee: { email: "user@example.com" },
  }),
}));

vi.mock("@/core/i18n", () => ({
  useT: () => (k: string, fallback?: string) => fallback ?? k,
}));

vi.mock("@/core/config/appStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/core/config/appStore")>();
  return {
    ...actual,
    useAppStore: () => ({
      openTabs: [
        {
          instanceId: "tab-custom-fields-1",
          pageKey: "custom-fields",
          instanceIndex: 1,
        },
      ],
      currentInstanceId: "tab-custom-fields-1",
      navigate: vi.fn(),
      closeTab: vi.fn(),
    }),
  };
});

describe("useV2AdaptedNavSections - custom-fields in sec-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes custom-fields in sec-settings when user has ADMIN_USERS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");

    expect(settingsSec).toBeDefined();
    const customFieldsItem = settingsSec?.items.find(
      (item) => item.id === "custom-fields",
    );
    expect(customFieldsItem).toBeDefined();
    expect(customFieldsItem?.href).toBe("/custom-fields");
    expect(customFieldsItem?.label).toBe("Trường tùy chỉnh");
    expect(customFieldsItem?.icon).toBe(Sliders);
  });

  it("includes custom-fields when user has INVENTORY_ITEMS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.INVENTORY_ITEMS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");

    expect(settingsSec).toBeDefined();
    const customFieldsItem = settingsSec?.items.find(
      (item) => item.id === "custom-fields",
    );
    expect(customFieldsItem).toBeDefined();
    expect(customFieldsItem?.href).toBe("/custom-fields");
  });

  it("excludes custom-fields when user lacks any relevant permissions", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");

    expect(settingsSec).toBeUndefined();
  });
});

describe("useV2AdaptedNavSections - bank & cash fund in sec-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes settings-bank when user has BANK_STATEMENTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.BANK_STATEMENTS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");
    const bankItem = settingsSec?.items.find(
      (item) => item.id === "settings-bank",
    );

    expect(bankItem).toBeDefined();
    expect(bankItem?.href).toBe("/settings-bank");
    expect(bankItem?.label).toBe("Tài khoản ngân hàng");
    expect(bankItem?.icon).toBe(Landmark);
  });

  it("includes settings-cash-fund when user has CASH_STATEMENTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.CASH_STATEMENTS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");
    const cashFundItem = settingsSec?.items.find(
      (item) => item.id === "settings-cash-fund",
    );

    expect(cashFundItem).toBeDefined();
    expect(cashFundItem?.href).toBe("/settings-cash-fund");
    expect(cashFundItem?.label).toBe("Quỹ tiền mặt");
    expect(cashFundItem?.icon).toBe(Banknote);
  });

  it("excludes settings-bank and settings-cash-fund without their permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");

    expect(
      settingsSec?.items.find((item) => item.id === "settings-bank"),
    ).toBeUndefined();
    expect(
      settingsSec?.items.find((item) => item.id === "settings-cash-fund"),
    ).toBeUndefined();
  });
});

describe("useV2AdaptedTabs - custom-fields tab", () => {
  it("resolves label and icon for custom-fields tab", () => {
    const { result } = renderHook(() => useV2AdaptedTabs());
    const customFieldsTab = result.current.tabs.find(
      (t) => t.id === "tab-custom-fields-1",
    );

    expect(customFieldsTab).toBeDefined();
    expect(customFieldsTab?.label).toBe("Trường tùy chỉnh");
    expect(customFieldsTab?.icon).toBe(Sliders);
  });
});
