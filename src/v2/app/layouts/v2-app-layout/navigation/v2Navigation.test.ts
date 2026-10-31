import { describe, it, expect } from "vitest";
import {
  getV2NavItems,
  getV2NavigationSections,
  DEFAULT_V2_NAV_ITEMS,
  DEFAULT_V2_SECTIONS,
} from "./v2Navigation";

describe("v2Navigation", () => {
  it("generates navigation items with translated labels", () => {
    const mockT = (key: string, fallback?: string) => {
      if (key === "v2.nav.items.dashboard") return "Bảng điều khiển";
      if (key === "v2.nav.items.erpSalesOrders") return "Đơn hàng";
      return fallback ?? key;
    };

    const items = getV2NavItems(mockT);
    expect(items).toHaveLength(5);
    expect(items[0].label).toBe("Bảng điều khiển");
    expect(items[1].label).toBe("Đơn hàng");
    expect(items[0].href).toBe("/v2");
  });

  it("generates 7 sections with translated labels in English", () => {
    const mockEnT = (key: string, fallback?: string) => {
      const enDict: Record<string, string> = {
        "v2.nav.sections.admin": "OVERVIEW",
        "v2.nav.sections.sales": "SALES",
        "v2.nav.sections.purchasing": "PURCHASING",
        "v2.nav.sections.inventory": "INVENTORY",
        "v2.nav.sections.manufacturing": "MANUFACTURING",
        "v2.nav.sections.accounting": "ACCOUNTING & CASHFLOW",
        "v2.nav.sections.settings": "SETTINGS",
        "v2.nav.items.dashboard": "Dashboard",
        "v2.nav.items.erpSalesOrders": "Sales Orders",
        "v2.nav.items.customers": "Customers",
      };
      return enDict[key] ?? fallback ?? key;
    };

    const sections = getV2NavigationSections(mockEnT);
    expect(sections).toHaveLength(7);
    expect(sections[0].label).toBe("OVERVIEW");
    expect(sections[1].label).toBe("SALES");
    expect(sections[1].items[0].label).toBe("Sales Orders");
    expect(sections[1].items[1].label).toBe("Customers");
  });

  it("exports valid DEFAULT_V2_NAV_ITEMS and DEFAULT_V2_SECTIONS fallbacks", () => {
    expect(DEFAULT_V2_NAV_ITEMS.length).toBeGreaterThan(0);
    expect(DEFAULT_V2_SECTIONS.length).toBe(7);
    expect(DEFAULT_V2_SECTIONS[0].items[0].id).toBe("dashboard");
  });
});
