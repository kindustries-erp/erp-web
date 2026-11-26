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

let mockEmployeeEmail = "user@example.com";

vi.mock("@/modules/auth/domain/authStore", () => ({
  useAuthStore: () => ({
    employee: { email: mockEmployeeEmail },
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
          instanceId: "tab-garage-stock-vouchers-1",
          pageKey: "garage-stock-vouchers",
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

  it("resolves label and icon for garage-stock-vouchers tab", () => {
    const { result } = renderHook(() => useV2AdaptedTabs());
    const goodsReceiptTab = result.current.tabs.find(
      (t) => t.id === "tab-garage-stock-vouchers-1",
    );

    expect(goodsReceiptTab).toBeDefined();
    expect(goodsReceiptTab?.label).toBe("Chứng từ kho Garage");
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

describe("useV2AdaptedNavSections - garage stock items in sec-garage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes garage-stock-vouchers when user has explicit GARAGE_STOCK_VOUCHERS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_STOCK_VOUCHERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-stock-vouchers");

    expect(item).toBeDefined();
    expect(item?.href).toBe("/garage-stock-vouchers");
    expect(item?.label).toBe("Chứng từ kho Garage");
    expect(item?.icon).toBe(Package);
  });

  it("excludes garage-stock-vouchers when user only has GARAGE permission (no fallback)", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-stock-vouchers");

    expect(item).toBeUndefined();
  });

  it("shows garage-stock-balances only with GARAGE_STOCK_LEDGER permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.GARAGE_STOCK_LEDGER;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const balances = findNavChild(garageSec?.items, "garage-stock-balances");

    expect(balances?.href).toBe("/garage-stock-balances");
    expect(
      findNavChild(garageSec?.items, "garage-stock-vouchers"),
    ).toBeUndefined();
  });

  it("excludes garage stock items when user lacks garage permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const item = findNavChild(garageSec?.items, "garage-stock-vouchers");

    expect(item).toBeUndefined();
    expect(
      findNavChild(garageSec?.items, "garage-stock-balances"),
    ).toBeUndefined();
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
    expect(item?.href).toBe("/garage-procurement?tab=requests");
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

  it("shows only the workshop progress page when user has just GARAGE_WORKSHOP read", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (resource) => resource === ErpResource.GARAGE_WORKSHOP,
    );

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");

    expect(garageSec?.items.map((item) => item.id)).toEqual([
      "garage-workshop-progress",
    ]);
  });

  it("renders garage section items in the expected sequence when all permissions are granted", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const garageSec = result.current.find((s) => s.id === "sec-garage");
    const itemIds = garageSec?.items.map((item) => item.id);

    expect(itemIds).toEqual([
      "garage-cases",
      "garage-workshop-progress",
      "garage-cashflow",
      "garage-debts",
      "garage-opex",
      "garage-procurement",
      "garage-stock-vouchers",
      "garage-stock-balances",
    ]);
  });
});

describe("useV2AdaptedNavSections - accounting RBAC (journal-entry, settings-accounts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes journal-entry when user has JOURNAL_ENTRIES permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.JOURNAL_ENTRIES;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const sec = result.current.find((s) => s.id === "sec-accounting");
    const item = findNavChild(sec?.items, "journal-entry");

    expect(sec).toBeDefined();
    expect(item).toBeDefined();
    expect(item?.href).toBe("/journal-entry");
    expect(findNavChild(sec?.items, "settings-accounts")).toBeUndefined();
  });

  it("includes settings-accounts when user has ACCOUNTING_CONFIGS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ACCOUNTING_CONFIGS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const sec = result.current.find((s) => s.id === "sec-accounting");
    const item = findNavChild(sec?.items, "settings-accounts");

    expect(sec).toBeDefined();
    expect(item).toBeDefined();
    expect(item?.href).toBe("/settings-accounts");
    expect(findNavChild(sec?.items, "journal-entry")).toBeUndefined();
  });

  it("excludes journal-entry and settings-accounts when user only has INVOICES permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.INVOICES;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const sec = result.current.find((s) => s.id === "sec-accounting");

    expect(sec).toBeDefined();
    expect(findNavChild(sec?.items, "erp-invoices")).toBeDefined();
    expect(findNavChild(sec?.items, "journal-entry")).toBeUndefined();
    expect(findNavChild(sec?.items, "settings-accounts")).toBeUndefined();
  });

  it("hides sec-accounting entirely when user lacks all accounting permissions", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    expect(
      result.current.find((s) => s.id === "sec-accounting"),
    ).toBeUndefined();
  });
});

describe("useV2AdaptedNavSections - sec-tools RBAC (loans)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loans in sec-tools when user has LOANS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.LOANS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    const toolsSec = result.current.find((s) => s.id === "sec-tools");
    const loansItem = findNavChild(toolsSec?.items, "loans");

    expect(toolsSec).toBeDefined();
    expect(loansItem).toBeDefined();
    expect(loansItem?.href).toBe("/loans-tool");
  });

  it("hides sec-tools entirely when user lacks LOANS permission", () => {
    vi.mocked(useHasPermission).mockImplementation((resource) => {
      return resource === ErpResource.ADMIN_USERS;
    });

    const { result } = renderHook(() => useV2AdaptedNavSections());
    expect(result.current.find((s) => s.id === "sec-tools")).toBeUndefined();
  });
});

describe("useV2AdaptedNavSections - V2 items visibility for admin@liouni.com", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmployeeEmail = "user@example.com";
  });

  it("does not show (v2) items for regular users", () => {
    mockEmployeeEmail = "user@example.com";
    vi.mocked(useHasPermission).mockReturnValue(true);

    const { result } = renderHook(() => useV2AdaptedNavSections());

    const allItems = result.current.flatMap((s) => s.items);
    const customersV2 = findNavChild(allItems, "customers-v2");
    const suppliersV2 = findNavChild(allItems, "suppliers-v2");
    const invoicesV2 = findNavChild(allItems, "invoices-v2");
    const auditLogsV2 = findNavChild(allItems, "audit-logs-v2");
    const adminDashboardV2 = findNavChild(allItems, "admin-dashboard-v2");

    expect(customersV2).toBeUndefined();
    expect(suppliersV2).toBeUndefined();
    expect(invoicesV2).toBeUndefined();
    expect(auditLogsV2).toBeUndefined();
    expect(adminDashboardV2).toBeUndefined();
  });

  it("shows (v2) items with proper label and href only for admin@liouni.com", () => {
    mockEmployeeEmail = "admin@liouni.com";
    vi.mocked(useHasPermission).mockReturnValue(true);

    const { result } = renderHook(() => useV2AdaptedNavSections());

    const allItems = result.current.flatMap((s) => s.items);
    const customersV2 = findNavChild(allItems, "customers-v2");
    const suppliersV2 = findNavChild(allItems, "suppliers-v2");
    const invoicesV2 = findNavChild(allItems, "invoices-v2");
    const auditLogsV2 = findNavChild(allItems, "audit-logs-v2");
    const adminDashboardV2 = findNavChild(allItems, "admin-dashboard-v2");

    expect(customersV2).toBeDefined();
    expect(customersV2?.label).toContain("(v2)");
    expect(customersV2?.href).toBe("/customers-v2");

    expect(suppliersV2).toBeDefined();
    expect(suppliersV2?.label).toContain("(v2)");
    expect(suppliersV2?.href).toBe("/suppliers-v2");

    expect(invoicesV2).toBeDefined();
    expect(invoicesV2?.label).toContain("(v2)");
    expect(invoicesV2?.href).toBe("/invoices-v2");

    expect(auditLogsV2).toBeDefined();
    expect(auditLogsV2?.label).toContain("(v2)");
    expect(auditLogsV2?.href).toBe("/audit-logs-v2");

    expect(adminDashboardV2).toBeDefined();
    expect(adminDashboardV2?.label).toContain("(v2)");
    expect(adminDashboardV2?.href).toBe("/admin-dashboard-v2");
  });
});
