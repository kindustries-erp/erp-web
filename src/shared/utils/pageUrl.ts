import { PageKey } from "@/shared/types";

export const ALL_PAGE_KEYS: PageKey[] = [
  "dashboard",

  "purchasing",
  "erp-inventory-stock",
  "erp-inventory-tracking",
  "erp-inventory-tracking-parts",
  "erp-inventory-tracking-lot",
  "erp-inventory-tracking-custom",
  "erp-inventory-vouchers",
  "mfg-items",
  "mfg-purchase-orders",
  "mfg-vehicles",
  "erp-bom",
  "erp-inventory-items",
  "erp-inventory-uom",
  "erp-inventory-item-types",
  "erp-inventory-tracking-categories",
  "erp-suppliers",
  "erp-customers",
  "erp-users",
  "erp-activity-logs",
  "erp-permissions-core",
  "inventory-dashboard",
  "invoice-dashboard",
  "erp-invoices-in",
  "erp-invoices-out",
  "erp-invoices-draft",
  "bank-statement",
  "cash-statement",
  "email-inbox",
  "settings-bank",
  "settings-cash-fund",
  "settings-branch",
  "erp-production",
  "erp-sales-orders",
  "sales-report-dashboard",
  "erp-goods-issues",
  "erp-employees",
  "sys-tags",
  "garage-dashboard",
  "garage-cases",
  "garage-opex",
  "garage-receivables",
  "garage-payables",
  "garage-customers",
  "after-sales",
  "purchasing-report-dashboard",
  "vinfast-invoice-settlement",
];

const LEGACY_SLUGS: Record<string, PageKey> = {
  "mua-hang": "purchasing",
  kho: "erp-inventory-stock",
  "email-hop-thu": "email-inbox",
};

export interface PageUrlParsedState {
  page: PageKey;
  tab?: string;
  instanceIndex: 1 | 2;
  view?: string;
  drawerId?: string;
  drawerMode?: "view" | "edit";
  filters: Record<string, string>;
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  pageNumber?: number;
  pageSize?: number;
  sorts: string[];
}

export function encodeStateParam(obj: unknown): string {
  try {
    const json = JSON.stringify(obj);
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(unescape(encodeURIComponent(json)));
    }
    return "";
  } catch {
    return "";
  }
}

export function decodeStateParam<T = unknown>(str: string): T | null {
  try {
    if (!str) return null;
    let json = "";
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      json = decodeURIComponent(escape(window.atob(str)));
    } else {
      return null;
    }
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function pageToPath(
  page: PageKey,
  tab?: string,
  extraParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  const slug = page === "dashboard" ? "" : page;
  const base = slug ? `/${slug}` : "/";
  const searchParams = new URLSearchParams();

  if (tab) {
    searchParams.set("tab", tab);
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.set(k, String(v));
      }
    });
  }

  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

export function pageToUrl(
  page: PageKey,
  tab?: string,
  extraParams?: Record<string, string | number | boolean | undefined | null>,
): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return origin + pageToPath(page, tab, extraParams);
}

export function pathToPage(
  pathname: string,
  search: string,
): {
  page: PageKey;
  tab?: string;
  instanceIndex: 1 | 2;
  searchParams: URLSearchParams;
} | null {
  const slug = pathname.replace(/^\//, "");
  let page: PageKey | undefined;

  if (slug === "") {
    page = "dashboard";
  } else {
    page = ALL_PAGE_KEYS.includes(slug as PageKey)
      ? (slug as PageKey)
      : LEGACY_SLUGS[slug];
  }

  if (page === undefined) return null;
  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get("tab") ?? undefined;
  const instanceParam = searchParams.get("_i");
  const instanceIndex: 1 | 2 = instanceParam === "2" ? 2 : 1;

  return { page, tab, instanceIndex, searchParams };
}
