import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useV2AdaptedNavSections } from "../useV2AdaptedNavSections";
import { useV2AdaptedTabs } from "../useV2AdaptedTabs";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource } from "@/modules/system/types/rbac";
import { ClipboardList, Package } from "lucide-react";
import {
  Banknote,
  Landmark,
  Sliders,
  type V2SidebarItem,
} from "@/v2/shared/components";

function findNavChild(
  items: V2SidebarItem[] | undefined,
  id: string,
): V2SidebarItem | undefined {
  if (!items) return undefined;
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNavChild(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

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
        {
          instanceId: "tab-garage-goods-receipts-1",
          pageKey: "garage-goods-receipts",
          instanceIndex: 1,
        },
        {
          instanceId: "tab-garage-procurement-1",
          pageKey: "garage-procurement",
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
    const generalSettingsGroup = settingsSec?.items.find(
      (item) => item.id === "sub-general-settings",
    );
    expect(generalSettingsGroup).toBeDefined();

    const customFieldsItem = findNavChild(settingsSec?.items, "custom-fields");
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
    const customFieldsItem = findNavChild(settingsSec?.items, "custom-fields");
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
    const bankItem = findNavChild(settingsSec?.items, "settings-bank");

    expect(bankItem).toBeDefined();
    expect(bankItem?.href).toBe("/settings-bank");
    expect(bankItem?.label).toBe("Danh mục Ngân hàng");
    expect(bankItem?.icon).toBe(Landmark);
  });

  it("includes settings-cash-fund when user has CASH_STATEMENTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.CASH_STATEMENTS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");
    const cashFundItem = findNavChild(settingsSec?.items, "settings-cash-fund");

    expect(cashFundItem).toBeDefined();
    expect(cashFundItem?.href).toBe("/settings-cash-fund");
    expect(cashFundItem?.label).toBe("Danh mục Quỹ");
    expect(cashFundItem?.icon).toBe(Banknote);
  });

  it("excludes settings-bank and settings-cash-fund without their permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const settingsSec = result.current.find((s) => s.id === "sec-settings");

    expect(findNavChild(settingsSec?.items, "settings-bank")).toBeUndefined();
    expect(
      findNavChild(settingsSec?.items, "settings-cash-fund"),
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

  it("resolves label and icon for garage-goods-receipts tab", () => {
    const { result } = renderHook(() => useV2AdaptedTabs());
    const goodsReceiptTab = result.current.tabs.find(
      (t) => t.id === "tab-garage-goods-receipts-1",
    );

    expect(goodsReceiptTab).toBeDefined();
    expect(goodsReceiptTab?.label).toBe("Nhập kho Garage");
    expect(goodsReceiptTab?.icon).toBe(Package);
  });

  it("resolves label and icon for garage-procurement tab", () => {
    const { result } = renderHook(() => useV2AdaptedTabs());
    const prTab = result.current.tabs.find(
      (t) => t.id === "tab-garage-procurement-1",
    );

    expect(prTab).toBeDefined();
    expect(prTab?.label).toBe("Mua hàng Garage");
    expect(prTab?.icon).toBe(ClipboardList);
  });
});

describe("useV2AdaptedNavSections - garage-goods-receipts in sec-garage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes garage-goods-receipts when user has explicit GARAGE_GOODS_RECEIPTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_GOODS_RECEIPTS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-goods-receipts");

    expect(item).toBeDefined();
    expect(item?.href).toBe("/garage-goods-receipts");
    expect(item?.label).toBe("Nhập kho Garage");
    expect(item?.icon).toBe(Package);
  });

  it("includes garage-goods-receipts via fallback when user has GARAGE permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-goods-receipts");

    expect(item).toBeDefined();
    expect(item?.href).toBe("/garage-goods-receipts");
  });

  it("excludes garage-goods-receipts when user lacks garage permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-goods-receipts");

    expect(item).toBeUndefined();
  });
});

describe("useV2AdaptedNavSections - garage-procurement in sec-garage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes garage-procurement when user has explicit GARAGE_PROCUREMENT_REQUESTS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_PROCUREMENT_REQUESTS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-procurement");

    expect(item).toBeDefined();
    expect(item?.href).toBe("/garage-procurement");
    expect(item?.label).toBe("Mua hàng Garage");
    expect(item?.icon).toBe(ClipboardList);
  });

  it("excludes garage-procurement when user lacks garage procurement requests permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-procurement");

    expect(item).toBeUndefined();
  });
});
